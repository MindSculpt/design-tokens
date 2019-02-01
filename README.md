# Simple design tokens

## Design tokens provide an immutable source of truth across product teams.
Use design tokens to store brand colors, font families, class lists, or any other reusable value from your design system that gets used across multiple teams or applications.

This workflow is a simple example of how to easily integrate design tokens into your project simply using [Gulp](https://gulpjs.com/). This is a really easy task to accomplish that no one talks about (or one that you'll find much documentation on how-to accomplish it), and it's an awesome tool for design system teams to manage requirements across products and teams.

To illustrate the power of design tokens, the `.json` files in the `design-tokens` directory are organized into some common modules. When you run `gulpfile.js`, it:

1. merges all the design token `.json` files into one
2. outputs the merge `.json` file (this is your single-source-of-truth-file all teams would consume) into the root of the project
3. converts the merged `.json` file into a `.scss` file that gets dumped into your `scss` partials (never commit this file)
4. compiles all your `.scss` files (I'm pulling in [Tachyons](http://tachyons.io) for my example)
5. loads the `.json` tokens file into gulp's `data` object which makes your tokens available to your templating system (I use [Nunjucks](https://mozilla.github.io/nunjucks/) because it's dope.)
6. puts it all together and outputs a simple `HTML` template that relies on some of the token values

## How to run the project
1. Run `npm install`
2. Run `npm run build` or `gulp build` to start up the project
3. Move around directories, files as needed (just make sure to update paths where necessary)

## Questions or comments?
Hit me up on twitter: [@mindsculpt](https://twitter.com/mindsculpt)