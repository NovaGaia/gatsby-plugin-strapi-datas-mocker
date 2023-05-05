const { onPluginInit } = require('gatsby-plugin-schema-snapshot/gatsby-node')
const {
  createSchemaCustomization,
} = require('gatsby-plugin-schema-snapshot/gatsby-node')

let activity = null

const verifyConfig = (options, reporter, warnOnForceUpdate = false) => {
  let canUpdate = true
  if (options.strapiURL === undefined) {
    canUpdate = false
    reporter.panicOnBuild(
      `strapiURL undefined in Loaded \`gatsby-plugin-strapi-datas-mocker\`!`
    )
  }
  if (
    options.forceUpdate &&
    (options.forceUpdate === true || options.forceUpdate === `true`) &&
    warnOnForceUpdate
  ) {
    console.warn(
      `UPDATE_SCHEMA_SNAPSHOT is forced to TRUE, never publish this config on serveur!`
    )
  }
  if (options.gatsbyPluginSchemaSnapshotOptions === undefined) {
    canUpdate = false
    reporter.panicOnBuild(
      `gatsbyPluginSchemaSnapshotOptions undefined in Loaded \`gatsby-plugin-strapi-datas-mocker\`!`
    )
  }
  return canUpdate
}

/** @type {import('gatsby').GatsbyNode["onPluginInit"]} */
exports.onPluginInit = async ({ reporter }, options) => {
  if (!verifyConfig(options, reporter)) return null

  // Do nothing on production (build process), use shema.gql
  if (process.env.NODE_ENV === `production`)
    return onPluginInit(
      { reporter },
      { ...options.gatsbyPluginSchemaSnapshotOptions, update: false }
    )
  reporter.info(`Loaded \`gatsby-plugin-strapi-datas-mocker\``)

  // Update on forcing update
  if (
    options.forceUpdate &&
    (options.forceUpdate === true || options.forceUpdate === `true`)
  ) {
    return onPluginInit(
      { reporter },
      { ...options.gatsbyPluginSchemaSnapshotOptions, update: true }
    )
  }

  // read strapi plugin config
  activity = reporter.activityTimer(
    `Schema (re)generation with Strapi plugin \`nova-datas-mocker\``
  )
  const apiFetchURL = `${options.strapiURL}/nova-datas-mocker/isMockEnabled`

  fetch(apiFetchURL)
    .then(result => result.json())
    .then(data => {
      if (data.mockEnabled) {
        reporter.warn(`UPDATE_SCHEMA_SNAPSHOT is set to TRUE`)
        reporter.warn(
          `Don't forget to clean \`.cache\` and \`public\` folders before and after!`
        )
        return true
      }
      return false
    })
    .then(mockEnabled => {
      // launch gatsby-plugin-schema-snapshot with strapi update param
      return onPluginInit(
        { reporter },
        { ...options.gatsbyPluginSchemaSnapshotOptions, update: mockEnabled }
      )
    })
    .catch(error => {
      reporter.panicOnBuild(error)
      return null
    })
}
/** @type {import('gatsby').GatsbyNode["createSchemaCustomization"]} */
exports.createSchemaCustomization = async ({ actions, reporter }, options) => {
  if (!verifyConfig(options, reporter, true)) return null

  // Do nothing on production (build process), use shema.gql
  if (process.env.NODE_ENV === `production`)
    return createSchemaCustomization(
      { actions, reporter },
      { ...options.gatsbyPluginSchemaSnapshotOptions, update: false }
    )

  // Update on forcing update
  if (options.forceUpdate) {
    return createSchemaCustomization(
      { actions, reporter },
      { ...options.gatsbyPluginSchemaSnapshotOptions, update: true }
    )
  }

  // read strapi plugin config
  if (activity) {
    activity.start()
    activity.setStatus(`\`nova-datas-mocker\` is reading Strapi config`)
  }
  const apiFetchURL = `${options.strapiURL}/nova-datas-mocker/isMockEnabled`

  fetch(apiFetchURL)
    .then(result => result.json())
    .then(data => {
      if (activity)
        activity.setStatus(
          `\`nova-datas-mocker\` get confing from Strapi, \`mockEnabled\`=${data.mockEnabled}`
        )
      return data.mockEnabled
    })
    .then(mockEnabled => {
      createSchemaCustomization(
        { actions, reporter },
        { ...options.gatsbyPluginSchemaSnapshotOptions, update: mockEnabled }
      )
    })
    .catch(error => {
      if (activity)
        activity.setStatus(`\`nova-datas-mocker\` has finished with error`)
      reporter.panicOnBuild(error)
      return null
    })
}

/** @type {import('gatsby').GatsbyNode["sourceNodes"]} */
exports.sourceNodes = () => {
  if (activity) {
    activity.setStatus(`\`nova-datas-mocker\` has finished.`)
    activity.end()
  }
}
