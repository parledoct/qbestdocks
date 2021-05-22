import useSWR from 'swr'
import axios from 'axios'
const fetcher = url => axios.get(url).then(res => res.data)

export function useAnnotation (uuid) {
  const { data, error } = useSWR(uuid !== undefined ? `${process.env.API_URL}/v1/annotations/?annot_uuid=${uuid}` : null, fetcher)

  return {
    annotation: (data && data.length) ? data[0] : {},
    isLoading: !error && !data,
    isError: error
  }
}

export function useFileAnnotations (uuid) {
  const { data, error } = useSWR(uuid !== undefined ? `${process.env.API_URL}/v1/annotations/?file_uuid=${uuid}` : null, fetcher)

  return {
    annotations: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useFile (uuid) {
  const { data, error } = useSWR(uuid !== undefined ? `${process.env.API_URL}/v1/audio/get/${uuid}` : null, fetcher)

  return {
    file: data,
    isLoading: !error && !data,
    isError: error
  }
}
