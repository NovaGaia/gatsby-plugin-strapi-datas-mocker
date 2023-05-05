const { onPluginInit } = require('gatsby-plugin-schema-snapshot/gatsby-node')
const {
  createSchemaCustomization,
} = require('gatsby-plugin-schema-snapshot/gatsby-node')

let activity = null
let forceUpdateEnabled = false
let strapiUpdateEnabled = false

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
    (options.forceUpdate === true || options.forceUpdate === `true`)
  ) {
    forceUpdateEnabled = true
    if (warnOnForceUpdate)
      reporter.warn(
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

  // read strapi plugin config
  activity = reporter.activityTimer(
    `Schema (re)generation \`gatsby-plugin-strapi-datas-mocker\``
  )
  activity.start()
  // Update on forcing update
  if (forceUpdateEnabled) {
    activity.setStatus(
      `\`nova-datas-mocker\` is forced localy. \`forceUpdate\`=true`
    )
    return onPluginInit(
      { reporter },
      { ...options.gatsbyPluginSchemaSnapshotOptions, update: true }
    )
  }
  activity.setStatus(`\`nova-datas-mocker\` is reading Strapi configuration`)
  const apiFetchURL = `${options.strapiURL}/nova-datas-mocker/isMockEnabled`

  fetch(apiFetchURL)
    .then(result => result.json())
    .then(data => {
      activity.setStatus(
        `\`nova-datas-mocker\` has read Strapi configuration, \`mockEnabled\`=${data.mockEnabled}`
      )
      if (data.mockEnabled) {
        strapiUpdateEnabled = true
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
  if (forceUpdateEnabled) {
    activity.setStatus(
      `\`nova-datas-mocker\` is generating new schema forced with local configuration`
    )
    return createSchemaCustomization(
      { actions, reporter },
      { ...options.gatsbyPluginSchemaSnapshotOptions, update: true }
    )
  }

  if (strapiUpdateEnabled) {
    activity.setStatus(
      `\`nova-datas-mocker\` is generating new schema forced with Strapi activation`
    )
    return createSchemaCustomization(
      { actions, reporter },
      { ...options.gatsbyPluginSchemaSnapshotOptions, update: true }
    )
  }
}

/** @type {import('gatsby').GatsbyNode["sourceNodes"]} */
exports.sourceNodes = () => {
  if (activity) {
    if (forceUpdateEnabled || strapiUpdateEnabled) {
      activity.setStatus(`\`nova-datas-mocker\` has finished updating schema`)
    } else {
      activity.setStatus(`\`nova-datas-mocker\` hasn't updated schema`)
    }
    activity.end()
  }
}
