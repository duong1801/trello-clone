/** @format */

const capitalizeFirstLetter = (val) => {
	if (!val) return ""
	return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}

export default capitalizeFirstLetter
