# Instructions for Developers

## Publishing the package

To publish the package to the GitHub Package Registry, you need to have a personal GitHub token with `write:packages` permissions. You can create a personal access token in your GitHub account settings.

``` 
➜  jison-lex git:(master) cat .npmrc   
# Configure npm to use GitHub Packages for @ull-esit-pl scope
@ull-esit-pl:registry=https://npm.pkg.github.com
# See the .env file for the actual token value
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

The `.env` file contains s.t. like:

```
➜  jison-lex git:(master) ✗ cat .env
export NODE_AUTH_TOKEN=ghp_YOUR_GITHUB_TOKEN
```

Then you can publish the package with npm:

```console
npm publish
```



## Testing the package during development 

En tu proyecto jison-lex, crea un enlace global:

```
npm link
```


En el proyecto donde quieras usarlo, vincula el paquete:

```
npm link @ull-esit-pl/jison-lex
```

Esto crea un symlink que apunta a tu código fuente, así que los cambios se reflejan inmediatamente.