import * as d3 from 'd3-format'

export function formatLargeCurrencyValue (value) {
	return d3.format('$.5s')(value).replace(/G/, 'B')
}

export function formatCurrencyValue (value) {
	return d3.format('$,.2f')(value)
}

export function formatLargeNumber (value) {
	return d3.format('.5s')(value).replace(/G/, 'B')
}

export function formatPercentageValue (value) {
	return d3.format('.2%')(value)
}

export function formatNumberWithComma (value) {
	return d3.format(',.2r')(value)
}
