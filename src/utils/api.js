import fly from 'flyio.js'

export const getBanner = (params, loadingText) => fly.post('banner', params, loadingText)
export const getList = (params, loadingText) => fly.post('list', params, loadingText)
