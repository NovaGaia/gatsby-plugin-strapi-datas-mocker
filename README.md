<div align="center">
  <img style="width: 160px; height: auto;" src="./docs/logo-novagaia@3x.png" alt="Logo NovaGaïa" />
  <h1>Nova Strapi APIs Mocker compagnion</h1>
  <p>by <a href="https://novagaia.fr/" target="_blank">NovaGaïa</a>.</p>
  <p><strong>A gatsby plugin to interact with Strapi and the plugin <a href="https://market.strapi.io/plugins/nova-datas-mocker" target="_blank">`nova-datas-mocker`</a>.</strong></p>
<p><a href="https://github.com/NovaGaia/gatsby-plugin-strapi-datas-mocker/blob/main/CHANGELOG.md">CHANGELOG</a></p>
</div>

`gatsby-plugin-strapi-datas-mocker` is a complementary plugin to the Strapi`nova-datas-mocker`.

[`nova-datas-mocker`](https://market.strapi.io/plugins/nova-datas-mocker) takes care of mocking, on demand via a simple switch, all specified Strapi APIs and `gatsby-plugin-strapi-datas-mocker` drives the [`gatsby-plugin-schema-snapshot`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-schema-snapshot#readme) plugin to generate/update the Gatsby schema.

With these two plugins, you will stop wasting time maintaining the shema or the `gatsby-node.js` of Gatsby and you will have the certainty of no more GraphQL errors.

> **warn**:
>
> - Need `"nova-datas-mocker": "^1.3.10"` in Strapi.
> - Need `"gatsby-plugin-schema-snapshot": "^3.24.0"` in Gatsby (must be added by peerDepencies).

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
| `forceUpdate`                       | Force the plugin to update Schema, without using the switch on Strapi, _settings not recommanded_                                                               | `false`                      |
| `gatsbyPluginSchemaSnapshotOptions` | The configuration of the plugin [`gatsby-plugin-schema-snapshot`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-schema-snapshot#readme) | required, use `{}`           |

## WARN

`forceUpdate` in Gatsby will not activate mocking in Strapi!

---

<a href="https://www.buymeacoffee.com/renaudheluin" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>
