import 'dotenv/config'
import { src, dest, series, parallel } from 'gulp'
import concat from 'gulp-concat'
import terser from 'gulp-terser'
import { deleteAsync } from 'del'
import webpack from 'webpack-stream'
import TerserPlugin from 'terser-webpack-plugin'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
import sourceMaps from 'gulp-sourcemaps'
import rename from 'gulp-rename'

const sass = gulpSass(dartSass)

const RESOURCES_PATH = './server/resources'

const clean = () => deleteAsync([`${RESOURCES_PATH}/**/*`])

const webpackOptions = {
	mode: 'production',
	output: {
		filename: 'ws.min.js',
	},
	resolve: {
		roots: ['./'],
	},
	devtool: 'source-map',
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: false,
				terserOptions: {
					format: {
						comments: false,
					},
				},
			}),
		],
	},
}

const jsVendorSources = [
	'server/scripts/vendor/auto/nosleep.js',
	'server/scripts/vendor/auto/swiped-events.js',
	'server/scripts/vendor/auto/suncalc.js',
]

const compressJsVendor = () => src(jsVendorSources).pipe(concat('vendor.min.js')).pipe(terser()).pipe(dest(RESOURCES_PATH))

const mjsSources = [
	'server/scripts/modules/currentweatherscroll.mjs',
	'server/scripts/modules/hazards.mjs',
	'server/scripts/modules/currentweather.mjs',
	'server/scripts/modules/almanac.mjs',
	'server/scripts/modules/spc-outlook.mjs',
	'server/scripts/modules/icons.mjs',
	'server/scripts/modules/extendedforecast.mjs',
	'server/scripts/modules/hourly.mjs',
	'server/scripts/modules/hourly-graph.mjs',
	'server/scripts/modules/latestobservations.mjs',
	'server/scripts/modules/localforecast.mjs',
	'server/scripts/modules/radar.mjs',
	'server/scripts/modules/regionalforecast.mjs',
	'server/scripts/modules/travelforecast.mjs',
	'server/scripts/modules/progress.mjs',
	'server/scripts/modules/media.mjs',
	'server/scripts/modules/custom-scroll-text.mjs',
	'server/scripts/index.mjs',
]

const buildJs = () => src(mjsSources).pipe(webpack(webpackOptions)).pipe(dest(RESOURCES_PATH))

const cssSources = ['server/styles/scss/**/*.scss']
const buildCss = () =>
	src(cssSources)
		.pipe(sourceMaps.init())
		.pipe(sass({ style: 'compressed' }).on('error', sass.logError))
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourceMaps.write('./'))
		.pipe(dest(RESOURCES_PATH))

const buildDist = series(
	clean,
	parallel(buildJs, compressJsVendor, buildCss),
)

export default buildDist

export { buildDist }
