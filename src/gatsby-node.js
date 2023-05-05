const { onPluginInit } = require('gatsby-plugin-schema-snapshot/gatsby-node')
const {
  createSchemaCustomization,
} = require('gatsby-plugin-schema-snapshot/gatsby-node')

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
        `\`gatsby-plugin-strapi-datas-mocker\` is forced to TRUE, never publish this config on serveur!`
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
  if (forceUpdateEnabled) {
    return onPluginInit(
      { reporter },
      { ...options.gatsbyPluginSchemaSnapshotOptions, update: true }
    )
  }

  // read strapi plugin config
  const apiFetchURL = `${options.strapiURL}/nova-datas-mocker/isMockEnabled`

  fetch(apiFetchURL)
    .then(result => result.json())
    .then(data => {
      if (data.mockEnabled) {
        strapiUpdateEnabled = true
        reporter.warn(`Strapi \`nova-datas-mocker\` is set to TRUE in Strapi`)
        reporter.warn(
          `Don't forget to clean \`.cache\` and \`public\` folders before and after!`
        )
        return true
      }
      reporter.info(`Strapi \`nova-datas-mocker\` is set to false in Strapi`)
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
    return createSchemaCustomization(
      { actions, reporter },
      { ...options.gatsbyPluginSchemaSnapshotOptions, update: true }
    )
  }

  if (strapiUpdateEnabled) {
    return createSchemaCustomization(
      { actions, reporter },
      { ...options.gatsbyPluginSchemaSnapshotOptions, update: true }
    )
  }
}

/** @type {import('gatsby').GatsbyNode["createPages"]} */
exports.createPages = ({ reporter }) => {
  if (forceUpdateEnabled || strapiUpdateEnabled) {
    reporter.info(
      `\`gatsby-plugin-strapi-datas-mocker\` has finished updating schema`
    )
  }
}
