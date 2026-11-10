export async function readApiResponse(response) {
  let result
  try {
    result = await response.json()
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Máy chủ xác thực chưa sẵn sàng. Vui lòng khởi động lại ứng dụng bằng lệnh npm run dev.')
    }
    throw error
  }

  if (!response.ok) {
    throw new Error(result.error || 'Đã có lỗi xảy ra. Vui lòng thử lại.')
  }

  return result
}

export async function requestApiJson(path, { method = 'GET', body, accessToken } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  let response
  try {
    response = await fetch(path, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Không thể kết nối máy chủ. Vui lòng khởi động lại ứng dụng bằng lệnh npm run dev.')
    }
    throw error
  }

  return readApiResponse(response)
}

export function postApiJson(path, body) {
  return requestApiJson(`/api/auth/${path}`, { method: 'POST', body })
}


export async function uploadApiFile(path, file, accessToken) {
  let response
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
        'X-File-Name': encodeURIComponent(file.name),
      },
      body: file,
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Không thể kết nối máy chủ. Vui lòng khởi động lại ứng dụng bằng lệnh npm run dev.')
    }
    throw error
  }
  return readApiResponse(response)
}

export async function downloadApiFile(path, accessToken, fallbackName) {
  const response = await fetch(path, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!response.ok) await readApiResponse(response)
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fallbackName
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
