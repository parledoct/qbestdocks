import useSWR from 'swr'
import axios from 'axios'
const fetcher = url => axios.get(url).then(res => res.data)
const fetcher_with_body = params => url => axios.get(url, { params: params }).then(res => res.data)

import { API_URL } from './apiUrl.js'

export function useAnnotation (uuid) {
  const { data, error } = useSWR(uuid !== undefined ? `${API_URL}/v1/annotations/?annot_uuid=${uuid}` : null, fetcher)

  return {
    annotation: (data && data.length) ? data[0] : {},
    isLoading: !error && !data,
    isError: error
  }
}

export function useSearchAnnotations (uuid) {
  const { search, isLoading, isError } = useSearch(uuid)
  let annotations = []
  if (!isLoading) {
      annotations = search.annot_uuids.map((annot_uuid) => {
          let { data, error } = useSWR(uuid !== undefined ? `${API_URL}/v1/annotations/?annot_uuid=${uuid}` : null, fetcher)
          return [data, error]
      })
  }
  console.log(annotations.map((x) => !x[1] && !x[0]))
  return {
    searchAnnotations: annotations.map((x) => (x[0] && x[0].length) ? x[0][0] : {}),
    isLoading: isLoading || annotations.some((x) => !x[1] && !x[0]),
    isError: isError || annotations.some((x) => x[1])
  }
}

export function useFileAnnotations (uuid) {

  const { data, error } = useSWR(uuid !== undefined ? `${API_URL}/v1/annotations/?file_uuid=${uuid}` : null, fetcher)
  //console.log('api url', API_URL, process.env)
  return {
    annotations: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useFileResults (uuid) {

  const { data, error } = useSWR(uuid !== undefined ? `${API_URL}/v1/search/results/` : null, fetcher_with_body({ file_uuids: [uuid] }))
  //console.log('api url', API_URL, process.env)
  return {
    results: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useAnnotationResults (uuid) {

  const { data, error } = useSWR(uuid !== undefined ? `${API_URL}/v1/search/results/?annot_uuids[]=${uuid}` : null, fetcher)
  //console.log('api url', API_URL, process.env)
  return {
    results: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useFile (uuid) {
  const { data, error } = useSWR(uuid !== undefined ? `${API_URL}/v1/audio/get/${uuid}` : null, fetcher)

  return {
    file: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useFileList () {
  const { data, error } = useSWR(`${API_URL}/v1/audio/list`, fetcher)

  return {
    fileList: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useSearch (uuid) {
  const { data, error } = useSWR(uuid !== undefined ? `${API_URL}/v1/search/get/${uuid}` : null, fetcher)

  return {
    search: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useSearchStatus (uuid) {
  const { data, error } = useSWR(uuid !== undefined ? `${API_URL}/v1/search/status/${uuid}` : null, fetcher)

  return {
    status: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useSearchResults (uuid) {
  const { data, error } = useSWR(uuid !== undefined ? `${API_URL}/v1/search/results/?search_uuid=${uuid}` : null, fetcher)

  return {
    results: data,
    isLoading: !error && !data,
    isError: error
  }
}
