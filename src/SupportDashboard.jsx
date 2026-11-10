import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, BriefcaseBusiness, RefreshCw } from 'lucide-react'
import { requestApiJson } from './api.js'

const statusLabels = {
  new: 'Mới',
  in_progress: 'Đang xử lý',
  resolved: 'Đã giải quyết',
}

function formatDate(value) {
  return new Date(`${value.replace(' ', 'T')}Z`).toLocaleString('vi-VN')
}

function SupportDashboard({ accessToken, onHome, onLogout }) {
  const [requests, setRequests] = useState([])
  const [draftStatuses, setDraftStatuses] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchRequests = useCallback(
    () => requestApiJson('/api/support/requests', { accessToken }),
    [accessToken],
  )

  const loadRequests = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await fetchRequests()
      setRequests(result.requests)
      setDraftStatuses(Object.fromEntries(result.requests.map((request) => [request.id, request.status])))
    } catch (loadError) {
      setError(loadError.message || 'Không thể tải hộp thư hỗ trợ.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    fetchRequests()
      .then((result) => {
        if (!active) return
        setRequests(result.requests)
        setDraftStatuses(Object.fromEntries(result.requests.map((request) => [request.id, request.status])))
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Không thể tải hộp thư hỗ trợ.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [fetchRequests])

  const updateStatus = async (requestId) => {
    setError('')
    setUpdatingId(requestId)
    try {
      const status = draftStatuses[requestId]
      await requestApiJson(`/api/support/requests/${requestId}`, {
        method: 'PATCH',
        body: { status },
        accessToken,
      })
      setRequests((current) => current.map((request) => (
        request.id === requestId ? { ...request, status } : request
      )))
    } catch (updateError) {
      setError(updateError.message || 'Không thể cập nhật yêu cầu.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="support-page">
      <header className="site-header">
        <div className="page-shell header-inner">
          <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); onHome() }}>
            <span className="brand-icon"><BriefcaseBusiness size={21} strokeWidth={2.3} /></span>
            <span>Stu<span>Work</span></span>
          </a>
          <div className="support-header-actions">
            <span>Nhân viên hỗ trợ</span>
            <button className="button button-outline" type="button" onClick={onLogout}>Đăng xuất</button>
          </div>
        </div>
      </header>
      <main className="page-shell support-main">
        <button className="support-back" type="button" onClick={onHome}><ArrowLeft size={16} /> Về trang chủ</button>
        <div className="support-heading">
          <div>
            <span className="support-eyebrow">TRUNG TÂM HỖ TRỢ</span>
            <h1>Thắc mắc từ người dùng</h1>
            <p>Xem và cập nhật trạng thái các biểu mẫu liên hệ đã gửi.</p>
          </div>
          <button className="button button-outline support-refresh" type="button" onClick={loadRequests} disabled={loading}>
            <RefreshCw size={15} /> Làm mới
          </button>
        </div>

        {error && <div className="support-error" role="alert">{error}</div>}
        {loading ? (
          <div className="support-empty">Đang tải yêu cầu...</div>
        ) : requests.length === 0 ? (
          <div className="support-empty">Chưa có biểu mẫu liên hệ nào.</div>
        ) : (
          <div className="support-request-list">
            {requests.map((request) => (
              <article className="support-request-card" key={request.id}>
                <div className="support-request-heading">
                  <div>
                    <span className={`support-status-badge support-status-${request.status}`}>{statusLabels[request.status]}</span>
                    <h2>{request.subject}</h2>
                  </div>
                  <time dateTime={`${request.created_at.replace(' ', 'T')}Z`}>{formatDate(request.created_at)}</time>
                </div>
                <p className="support-request-message">{request.message}</p>
                <div className="support-request-footer">
                  <div className="support-request-sender">
                    <strong>{request.name}</strong>
                    <a href={`mailto:${request.email}`}>{request.email}</a>
                  </div>
                  <div className="support-status-control">
                    <label htmlFor={`request-status-${request.id}`}>Trạng thái</label>
                    <select
                      id={`request-status-${request.id}`}
                      value={draftStatuses[request.id] ?? request.status}
                      onChange={(event) => setDraftStatuses((current) => ({ ...current, [request.id]: event.target.value }))}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <button
                      className="button button-primary"
                      type="button"
                      disabled={draftStatuses[request.id] === request.status || updatingId === request.id}
                      onClick={() => updateStatus(request.id)}
                    >
                      {updatingId === request.id ? 'Đang lưu...' : 'Cập nhật'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default SupportDashboard
