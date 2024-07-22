/**
 * # views.ts
 *
 */
"use strict";

/**
 * ## Imports
 *
 */
import { assert } from "@hapi/hoek";
import Inert from "@hapi/inert";
import { marked as Marked } from "marked";
import Path from "path";
import Vision from "@hapi/vision";
import Handlebars from "handlebars";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * ### markdown view
 *
 * Use the GitHub Markdown css
 */

/**
 * ## init
 *
 */
const Views = {
	init: async function (server) {
		/**
		 * ### vision
		 *
		 * this establishes where the html is located
		 * and the engine to parse it
		 */
		await server
			.register({
				plugin: Vision,
			})
			.then(() => {
				console.log("Register views");
				server.views({
					engines: {
						html: Handlebars,
						md: {
							module: {
								compile: function (template: string) {
									return function (context) {
										var html = Marked.parse(template, context);
										return `<link rel="stylesheet" href="/assets/github-markdown.css">
<style>
    .markdown-body {
        box-sizing: border-box;
        min-width: 200px;
        max-width: 980px;
        margin: 0 auto;
        padding: 45px;
    }
</style>
<article class="markdown-body">
    ${html}
</article>`;
									};
								},
							},
							contentType: "text/html",
						},
					},
					relativeTo: __dirname,
					path: [Path.join(__dirname, "../views"), Path.join(__dirname, "../docs")],
				});
			})
			.catch((err) => {
				assert(!err, err);
			});
		/**
		 * ### inert
		 *
		 * this says that any request for /assest/* will
		 * be served from the ../assests dir
		 *
		 * The resetpassword.js is located in ../assests
		 *
		 */
		await server
			.register({
				plugin: Inert,
			})
			.then(() => {
				//Load files located in ../assets
				server.route({
					method: "GET",
					path: "/assets/{param*}",
					handler: {
						directory: {
							path: Path.join(__dirname, "../assets"),
						},
					},
				});
			})
			.catch((err) => {
				//Confirm no err
				assert(!err, err);
			});
	},
};

export default Views;
