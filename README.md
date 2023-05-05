# GATSBY-PLUGIN-NOVA-DATAS-MOCKER

A gatsby plugin to interact with Strapi and the plugin [`nova-datas-mocker`](https://market.strapi.io/plugins/nova-datas-mocker).

`gatsby-plugin-strapi-datas-mocker`is a complementary plugin to the Strapi`nova-datas-mocker`.

[`nova-datas-mocker`](https://market.strapi.io/plugins/nova-datas-mocker) takes care of mocking, on demand via a simple switch, all specified Strapi APIs and `gatsby-plugin-strapi-datas-mocker` drives the [`gatsby-plugin-schema-snapshot`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-schema-snapshot#readme) plugin to generate/update the Gatsby schema.

With these two plugins, you will stop wasting time maintaining the shema or the `gatsby-node.js` of Gatsby and you will have the certainty of no more GraphQL errors.

> **warn**:
>
> - Need `"nova-datas-mocker": "^1.3.10"` in Strapi.
> - Need `"gatsby-plugin-schema-snapshot": "^3.24.0"` in Gatsby (is loaded with peerDepencies).

## Installation

```
npm i gatsby-plugin-strapi-datas-mocker
or
yarn add gatsby-plugin-strapi-datas-mocker
```

## Configuration

add this to your `gatsby-config.js` file

```javascript
plugins: [
  // ...
  {
    resolve: `gatsby-plugin-strapi-datas-mocker`,
    options: {
      strapiURL: `strapiURL`, // required
      // gatsbyPluginSchemaSnapshotOptions is required, could be {}
      gatsbyPluginSchemaSnapshotOptions: {
        path: `schema.gql`,
        exclude: {
          plugins: [],
        },
      },
    },
  },
  // ...
]
```

| property                            | function                                                                                                                                                        | default value                |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `strapiURL`                         | Strapi URL, with port, without trailling slach                                                                                                                  | `required`, no default value |
| `forceUpdate`                       | Force the plugin to update Shcema, without using the switch on Strapi (not recommanded)                                                                         | `false`                      |
| `gatsbyPluginSchemaSnapshotOptions` | The configuration of the plugin [`gatsby-plugin-schema-snapshot`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-schema-snapshot#readme) | required, use `{}`           |
