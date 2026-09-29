import { useState, useEffect, useCallback } from 'react'
import {
  FaSearch,
  FaSpinner,
  FaInfoCircle,
  FaPhone,
  FaEnvelope,
  FaCopy,
  FaBuilding,
  FaClock,
  FaFileAlt,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaArrowLeft,
  FaList,
  FaCalendarAlt,
  FaFileSignature
  ,FaUpload, FaImage, FaTimes
} from 'react-icons/fa'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { SCHOOL, OFFICE, SYSTEM, THEME } from '../../config/trac.config'
import Toast from '../components/Toast'

export default function TrackStatus() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [searchInput, setSearchInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [requestData, setRequestData] = useState(null)
  const [error, setError] = useState('')
  const [userRequests, setUserRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [orNumber, setOrNumber] = useState('')
  const [orImage, setOrImage] = useState(null)
  const [orPreview, setOrPreview] = useState('')
  const [uploadingOr, setUploadingOr] = useState(false)
  const [orUploadError, setOrUploadError] = useState('')
  const [toast, setToast] = useState(null)
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    ready: 0,
    claimed: 0,
    rejected: 0,
    total: 0
  })

  const [officeHours, setOfficeHours] = useState(OFFICE.schedule.display)
  const [contactEmail, setContactEmail] = useState(SCHOOL.contact.email)
  const [contactNumber] = useState(SCHOOL.contact.phone)
  const [locationInfo] = useState(SCHOOL.contact.location)

  useEffect(() => {
    if (!orPreview) return undefined
    return () => URL.revokeObjectURL(orPreview)
  }, [orPreview])

  const API_BASE_URL = `${SYSTEM.apiBaseUrl}/requests`
  const ADMIN_API_URL = SYSTEM.apiBaseUrl

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${ADMIN_API_URL}/public/settings`);
        if (response.ok) {
          const data = await response.json()
          if (data.office_hours) setOfficeHours(data.office_hours)
          if (data.contact_email) setContactEmail(data.contact_email)
        }
      } catch {
        console.warn('Using TRAC default settings')
      }
    }
    fetchSettings()
  }, [ADMIN_API_URL])

  const formatAmount = useCallback((feeTotal) => {
    if (feeTotal === null || feeTotal === undefined || !Number.isFinite(Number(feeTotal))) return 'Not recorded'
    return `₱${Number(feeTotal).toFixed(2)}`
  }, [])

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '—'
    try {
      let date;
      if (dateString instanceof Date) date = dateString;
      else if (typeof dateString === 'string') {
        if (dateString.includes('T')) date = new Date(dateString);
        else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = dateString.split('-');
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else date = new Date(dateString);
      } else if (typeof dateString === 'number') date = new Date(dateString);
      if (date && !isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      }
      return '—';
    } catch { return '—'; }
  }, [])

  const formatFullDate = useCallback((dateString) => {
    if (!dateString) return null
    try {
      let date;
      if (dateString instanceof Date) date = dateString;
      else if (typeof dateString === 'string') {
        if (dateString.includes('T')) date = new Date(dateString);
        else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = dateString.split('-');
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else date = new Date(dateString);
      } else if (typeof dateString === 'number') date = new Date(dateString);
      if (date && !isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      }
      return null;
    } catch { return null; }
  }, [])

  const fetchUserRequests = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('You are not logged in. Please login to continue.')
        setLoading(false)
        return
      }
      const response = await fetch(`${API_BASE_URL}/user/requests`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 503 || data.code === 'DATABASE_UNAVAILABLE') {
          throw new Error('The request service is temporarily unavailable. Please try again in a moment.')
        }
        throw new Error(data.message || data.error || 'Failed to fetch requests')
      }

      const transformedRequests = (data.requests || []).map(req => ({
        id: req.tracking_code,
        docType: req.document,
        requestDate: formatDate(req.date_submitted),
        rawDate: req.date_submitted,
        status: req.status,
        queue_number: req.queue_number
      }))

      const sortedRequests = [...transformedRequests].sort((a, b) => {
        const dateA = a.rawDate ? new Date(a.rawDate) : new Date(0)
        const dateB = b.rawDate ? new Date(b.rawDate) : new Date(0)
        return dateB - dateA
      })

      setUserRequests(sortedRequests)
      setStats(data.stats || { pending: 0, processing: 0, ready: 0, claimed: 0, rejected: 0, total: data.pagination?.total || 0 })
    } catch (error) {
      console.error('❌ Error fetching user requests:', error)
      setError(error.message || 'Failed to load your requests')
    } finally { setLoading(false) }
  }, [API_BASE_URL, formatDate])

  const fetchRequestDetails = useCallback(async (trackingCode) => {
    setLoading(true)
    setIsSearching(true)
    setError('')
    setRequestData(null)
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('You are not logged in. Please login to continue.')
        setLoading(false)
        return
      }
      const response = await fetch(`${API_BASE_URL}/user/requests/${trackingCode}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || data.error || 'Request not found')
      const calculatedAmount = formatAmount(data.fee_total)
      const transformedData = {
        id: data.tracking_code,
        trackingCode: data.tracking_code,
        docType: data.request_type,
        purpose: 'Document Request',
        status: data.status,
        amount: calculatedAmount,
        paymentStatus: 'Unpaid',
        copies: data.copies,
        requestDate: formatFullDate(data.date_sent) || data.date_sent,
        rawDate: data.date_sent,
        processingTime: data.processing_days_snapshot
          ? `${data.processing_days_snapshot} working day(s)`
          : 'Not recorded',
        estimatedCompletion: formatFullDate(data.estimated_completion_date) || data.estimated_completion_date,
        processed_date: data.processed_date,
        approvedDate: formatFullDate(data.processed_date),
        readyDate: formatFullDate(data.ready_date),
        claimedDate: formatFullDate(data.claimed_date),
        rejectedDate: formatFullDate(data.rejected_date),
        rejectedReason: data.rejected_reason,
        orNumber: data.or_number || '',
        orImageUrl: data.or_image_url,
        orUploadedAt: data.or_uploaded_at,
        orRejectionReason: data.or_rejection_reason,
        queue_number: data.queue_number,
        officerInCharge: 'Registrar Office',
        contact: contactNumber,
        location: locationInfo,
        officeHours: officeHours,
        requirements: OFFICE.pickup.required
      }
      setRequestData(transformedData)
      setOrNumber(transformedData.orNumber)
      setOrImage(null)
      setOrPreview('')
    } catch (error) {
      console.error('❌ Error fetching request details:', error)
      setError(error.message || `Request not found: ${trackingCode}`)
    } finally { setLoading(false); setIsSearching(false) }
  }, [API_BASE_URL, contactNumber, formatFullDate, formatAmount, locationInfo, officeHours])

  const handleOrFileChange = (file) => {
    setOrUploadError('')
    if (!file) {
      setOrImage(null)
      setOrPreview('')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setOrImage(null)
      setOrPreview('')
      setOrUploadError('Please select a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setOrImage(null)
      setOrPreview('')
      setOrUploadError('The OR image must be 5 MB or smaller.')
      return
    }
    setOrImage(file)
    setOrPreview(URL.createObjectURL(file))
  }

  const submitOfficialReceipt = async (event) => {
    event.preventDefault()
    if (!requestData || !orNumber.trim() || !orImage) {
      setOrUploadError('Enter the OR number and select an OR image.')
      return
    }
    setUploadingOr(true)
    setOrUploadError('')
    try {
      const formData = new FormData()
      formData.append('or_number', orNumber.trim())
      formData.append('or_image', orImage)
      const response = await fetch(`${API_BASE_URL}/${requestData.id}/or`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        body: formData
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to submit official receipt.')
      setRequestData(previous => ({ ...previous, status: 'or_submitted', orNumber: data.request.or_number, orImageUrl: data.request.or_image_url, orUploadedAt: data.request.or_uploaded_at, orRejectionReason: null }))
      setOrImage(null)
      setOrPreview('')
    } catch (error) {
      setOrUploadError(error.message)
    } finally {
      setUploadingOr(false)
    }
  }

  useEffect(() => { fetchUserRequests() }, [fetchUserRequests])
  useEffect(() => { if (id) { setSearchInput(id); fetchRequestDetails(id) } }, [id, fetchRequestDetails])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchInput.trim()) { setError('Please enter a Request ID'); return }
    navigate(`/track/${searchInput.trim()}`)
  }

  const clearSearch = () => {
    setSearchInput('')
    setRequestData(null)
    setError('')
    navigate('/track', { replace: true })
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setToast({ type: 'success', message: 'Copied to clipboard.' })
    } catch {
      setToast({ type: 'error', message: 'Could not copy to clipboard.' })
    }
  }

  const getStatusConfig = (status) => {
    const config = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Pending' },
      'processing': { bg: 'bg-green-100', text: 'text-green-800', label: '⚙️ Processing' },
      'approved': { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Approved - Upload OR' },
      'or_submitted': { bg: 'bg-blue-100', text: 'text-blue-800', label: '🧾 OR Under Review' },
      'or_rejected': { bg: 'bg-red-100', text: 'text-red-800', label: '⚠️ OR Needs Correction' },
      'or_confirmed': { bg: 'bg-green-100', text: 'text-green-800', label: '✅ OR Confirmed' },
      'ready': { bg: 'bg-amber-100', text: 'text-amber-800', label: '📦 Ready' },
      'claimed': { bg: 'bg-[#F1F8E9] text-[#1B5E20] border border-green-200', text: 'text-[#1B5E20]', label: '✅ Claimed' },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Rejected' }
    }
    return config[status] || config.pending
  }

  const getPaymentStatusBadge = (status) => status === 'Paid' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'

  const getTimeline = (status, request) => {
    const baseTimeline = [{ title: 'Request Submitted', description: 'Your request has been received by the system', date: request.requestDate, status: 'completed' }]
    if (status === 'pending') return [...baseTimeline, { title: 'Pending Approval', description: 'Waiting for registrar staff to review your request', date: '—', status: 'pending' }]
    if (status !== 'pending') baseTimeline.push({ title: 'Request Approved', description: 'Your request was approved. Upload your Official Receipt to continue.', date: request.requestDate, status: 'completed' })
    if (['or_submitted', 'or_confirmed', 'processing', 'ready', 'claimed'].includes(status)) baseTimeline.push({ title: 'Official Receipt Submitted', description: status === 'or_submitted' ? 'Your Official Receipt is waiting for Registrar review.' : 'Your Official Receipt was submitted successfully.', date: request.orUploadedAt, status: 'completed' })
    if (status === 'or_rejected') baseTimeline.push({ title: 'Official Receipt Needs Correction', description: request.orRejectionReason || 'Please upload a corrected Official Receipt.', date: request.orUploadedAt, status: 'rejected' })
    if (['or_confirmed', 'processing', 'ready', 'claimed'].includes(status)) baseTimeline.push({ title: 'Official Receipt Confirmed', description: 'Your Official Receipt has been confirmed.', date: request.orUploadedAt, status: 'completed' })
    if (['processing', 'ready', 'claimed'].includes(status)) baseTimeline.push({ title: 'Processing', description: `Your request is being processed. Amount to pay: ₱${request.amount}`, date: request.approvedDate, status: 'completed' })
    if (status === 'ready' || status === 'claimed') baseTimeline.push({ title: 'Ready for Pickup', description: 'Your document is now ready for pickup at the Registrar Office', date: request.readyDate || request.requestDate, status: 'completed' })
    if (status === 'claimed') baseTimeline.push({ title: 'Claimed', description: `Document claimed. OR Number: ${request.orNumber || 'OR-12345'}`, date: request.claimedDate || request.requestDate, status: 'completed' })
    if (status === 'rejected') baseTimeline.push({ title: 'Request Rejected', description: request.rejectedReason || 'Your request was rejected. Please contact the Registrar Office.', date: request.rejectedDate || request.requestDate, status: 'rejected' })
    return baseTimeline
  }

  const StatusBadge = ({ status }) => { const config = getStatusConfig(status); return <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span> }
  const TimelineIcon = ({ status }) => status === 'completed' ? <FaCheckCircle className="w-5 h-5 text-[#2E7D32]" /> : status === 'rejected' ? <FaExclamationTriangle className="w-5 h-5 text-red-500" /> : <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
  const TimelineItem = ({ title, description, date, status, isLast, request }) => (
    <div className="flex min-w-0">
      <div className="flex flex-col items-center mr-4">
        <div className="w-10 h-10 rounded-full bg-white border-2 border-green-100 flex items-center justify-center"><TimelineIcon status={status} /></div>
        {!isLast && <div className="w-0.5 h-full bg-green-100 mt-2"></div>}
      </div>
      <div className={`min-w-0 flex-1 pb-6 ${isLast ? '' : 'border-b border-gray-100'}`}>
        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"><h4 className="break-words font-bold text-gray-800">{title}</h4><div className="shrink-0 text-sm text-gray-500">{date && date !== '—' ? formatFullDate(date) : 'Pending'}</div></div>
        <p className="break-words text-sm text-gray-600">{description}</p>
        {title === 'Approved and Processing' && <div className="mt-2 p-2 bg-[#F1F8E9] rounded-lg inline-block"><p className="text-xs text-[#1B5E20] font-medium">💰 Amount to pay: ₱{request.amount}</p></div>}
      </div>
    </div>
  )

  const RequestCard = ({ request }) => {
    const config = getStatusConfig(request.status)
    return (
      <Link to={`/track/${request.id}`} className="mb-3 block rounded-xl border border-green-100 bg-white p-4 shadow-sm transition hover:border-[#1B5E20]/30 hover:shadow-lg sm:p-6">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <FaFileAlt className="text-[#1B5E20] text-lg" />
            <div className="min-w-0">
              <h3 className="break-words font-semibold text-gray-800">{request.docType}</h3>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>{config.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 sm:shrink-0">
            <FaCalendarAlt className="text-gray-400" />
            <span>{request.requestDate}</span>
          </div>
        </div>
        {request.queue_number && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <span className="text-xs text-gray-500">Queue #:</span>
            <span className="inline-flex items-center justify-center w-7 h-7 bg-gradient-to-r from-[#1B5E20]/10 to-[#F9A825]/10 rounded-full text-sm font-bold text-[#1B5E20]">
              {request.queue_number}
            </span>
          </div>
        )}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-[#F1F8E9]/30 p-4">
      <Toast type={toast?.type} message={toast?.message} onDismiss={() => setToast(null)} />
      <div className="w-full max-w-4xl mx-auto">
        {id && <button onClick={clearSearch} className="mb-4 flex items-center gap-2 px-4 py-2 border border-green-100 bg-white rounded-xl text-gray-600 hover:bg-green-50 hover:border-green-200 transition"><FaArrowLeft className="text-sm" /><span>Back to All Requests</span></button>}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-[#1B5E20] to-[#F9A825] bg-clip-text text-transparent">
            Track Your Requests
          </h1>
          <p className="text-gray-600">{requestData ? '' : 'View and track all your document requests'} - {SCHOOL.shortName}</p>
        </div>

        {!requestData && !id && !loading && userRequests.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-3 lg:grid-cols-5">
            <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-100"><span className="font-bold text-yellow-800">{stats.pending}</span><p className="text-yellow-600">Pending</p></div>
            <div className="bg-green-50 p-2 rounded-lg border border-green-100"><span className="font-bold text-[#1B5E20]">{stats.processing}</span><p className="text-green-600">Processing</p></div>
            <div className="bg-amber-50 p-2 rounded-lg border border-amber-100"><span className="font-bold text-amber-800">{stats.ready}</span><p className="text-amber-600">Ready</p></div>
            <div className="bg-[#F1F8E9] p-2 rounded-lg border border-green-200"><span className="font-bold text-[#1B5E20]">{stats.claimed}</span><p className="text-[#2E7D32]">Claimed</p></div>
            <div className="bg-red-50 p-2 rounded-lg border border-red-100"><span className="font-bold text-red-800">{stats.rejected}</span><p className="text-red-600">Rejected</p></div>
          </div>
        )}

        {!requestData && !isSearching && !id && (
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 mb-6">
            <form onSubmit={handleSearch}>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Enter Request ID to track (e.g., REQ-20260212-933)"
                      className="w-full pl-10 pr-4 py-3 border border-green-100 rounded-lg focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <button type="submit" disabled={!searchInput.trim()} className="trac-button flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium">
                  <FaSearch /> Track Request
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">You can find your Request ID in your Email</p>
            </form>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-700">{error}</p>
                    <p className="text-sm text-red-600 mt-1">Please check your Request ID and try again</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-12 text-center">
            <FaSpinner className="animate-spin text-3xl text-[#1B5E20] mx-auto mb-4" />
            <p className="text-gray-600">Loading your requests...</p>
          </div>
        )}

        {!loading && !requestData && !id && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><FaList className="text-[#1B5E20]" /> Your Recent Requests</h2>
              <span className="text-sm text-gray-500">{userRequests.length} {userRequests.length === 1 ? 'request' : 'requests'}</span>
            </div>
            {userRequests.length > 0 ? (
              <div>
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 border-b border-green-100 bg-[#F1F8E9] rounded-t-lg">
                  <div className="col-span-5">Document</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-2 text-center">Queue #</div>
                  <div className="col-span-3 text-right">Date Submitted</div>
                </div>
                {userRequests.map(request => <RequestCard key={request.id} request={request} />)}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-green-100 p-12 text-center">
                <div className="w-20 h-20 bg-[#F1F8E9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaFileSignature className="text-3xl text-[#1B5E20]" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">You haven't made any document requests. Start by requesting a document or form.</p>
                <button onClick={() => navigate('/request')} className="px-6 py-3 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white rounded-lg font-medium hover:opacity-90 transition">Make a Request</button>
              </div>
            )}
          </div>
        )}

        {requestData && !loading && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                        <div className="mb-2 flex min-w-0 items-start gap-3">
                          <FaFileAlt className="mt-1 shrink-0 text-xl text-[#1B5E20]" />
                          <h2 className="min-w-0 break-words text-xl font-semibold text-gray-900">{requestData.docType}</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-mono bg-[#F1F8E9] px-3 py-1 rounded-md text-gray-700">{requestData.id}</span>
                      <button onClick={() => copyToClipboard(requestData.id)} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-green-50 rounded" title="Copy Request ID">
                        <FaCopy className="text-xs" />
                      </button>
                    </div>
                    <p className="mt-2 break-words text-sm text-gray-600">Requested on {requestData.requestDate} • {requestData.purpose}</p>
                    {requestData.status === 'rejected' && requestData.rejectedReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                        <p className="break-words text-sm text-red-700">{requestData.rejectedReason}</p>
                      </div>
                    )}
                  </div>
                  <StatusBadge status={requestData.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              {requestData.queue_number && (
                <div className="bg-gradient-to-br from-[#F1F8E9] to-[#DCEDC8] p-4 rounded-xl border border-green-200 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Queue Position</p>
                  <p className="font-bold text-[#1B5E20] text-3xl">#{requestData.queue_number}</p>
                 </div>
              )}

              <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Amount</p>
                <p className="font-bold text-[#1B5E20] text-lg">{requestData.amount}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getPaymentStatusBadge(requestData.paymentStatus)}`}>{requestData.paymentStatus}</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Est. Completion</p>
                <p className="font-medium text-gray-900">{requestData.estimatedCompletion || '—'}</p>
                <p className="text-xs text-gray-500">{requestData.processingTime}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Copies</p>
                <p className="font-medium text-gray-900">{requestData.copies}</p>
                <p className="text-xs text-gray-500">{requestData.copies === 1 ? '' : 'copies'}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"><FaClock className="text-[#1B5E20]" /> Request Timeline</h3>
              <div className="space-y-4">{getTimeline(requestData.status, requestData).map((item, index, arr) => <TimelineItem key={index} title={item.title} description={item.description} date={item.date} status={item.status} isLast={index === arr.length - 1} request={requestData} />)}</div>
            </div>

            {['approved', 'or_rejected'].includes(requestData.status) && (
              <form onSubmit={submitOfficialReceipt} className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden">
                <div className="bg-[#1B5E20] p-5 text-white flex items-center gap-3">
                  <div className="p-2 bg-[#F9A825] rounded-lg"><FaUpload /></div>
                  <div><h3 className="font-bold text-lg">{requestData.status === 'or_rejected' ? 'Upload Corrected Official Receipt' : 'Upload Official Receipt'}</h3><p className="text-sm text-green-100">{requestData.status === 'or_rejected' ? 'Replace the receipt that needs correction' : 'Submit your payment proof'}</p></div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="rounded-xl border border-green-100 bg-[#F1F8E9]/60 p-4 text-sm text-gray-700">
                    <p className="font-semibold text-[#1B5E20]">📌 Instructions:</p>
                    <ol className="list-decimal list-inside mt-2 space-y-1"><li>Pay at the Cashier's Office</li><li>Get your Official Receipt (OR)</li><li>Upload a clear photo of your OR below</li></ol>
                  </div>
                  {requestData.status === 'or_rejected' && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><strong>Correction needed:</strong> {requestData.orRejectionReason || 'The Registrar needs a clearer or corrected Official Receipt.'}</div>}
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                    <p className="font-semibold">For a clear receipt photo</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>Keep the entire receipt inside the frame.</li>
                      <li>Tap to focus so the printed text is sharp.</li>
                      <li>Avoid glare, shadows, and motion blur.</li>
                    </ul>
                  </div>
                  <label className="block text-sm font-semibold text-gray-700">OR Number <span className="text-red-500">*</span><input value={orNumber} onChange={event => setOrNumber(event.target.value)} placeholder="e.g., OR-2026-001" className="mt-2 w-full rounded-lg border-2 border-[#2E7D32] px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-green-200" /></label>
                  <label className="block text-sm font-semibold text-gray-700">OR Image <span className="text-red-500">*</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => handleOrFileChange(event.target.files?.[0])} className="mt-2 block w-full rounded-lg border border-dashed border-[#2E7D32] p-4 text-sm" /></label>
                  {(orPreview || requestData.orImageUrl) && <div className="relative rounded-lg border border-green-100 p-2"><img src={orPreview || requestData.orImageUrl} alt="Official receipt preview" className="max-h-64 w-full rounded object-contain" />{orPreview && <button type="button" onClick={() => { setOrImage(null); setOrPreview('') }} className="absolute right-3 top-3 rounded-full bg-red-600 p-2 text-white" title="Remove selected image"><FaTimes /></button>}</div>}
                  {orUploadError && <p className="text-sm text-red-600">{orUploadError}</p>}
                  <button type="submit" disabled={uploadingOr} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2E7D32] px-4 py-3 font-semibold text-white transition hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-60"><FaUpload />{uploadingOr ? 'Submitting...' : requestData.status === 'or_rejected' ? 'Submit Corrected OR' : 'Submit OR'}</button>
                </div>
              </form>
            )}

            {requestData.status === 'or_submitted' && <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-900"><div className="flex items-center gap-3"><FaImage className="text-xl" /><div><h3 className="font-bold">Official Receipt Submitted</h3><p className="text-sm">Your OR is waiting for Registrar confirmation.</p></div></div></div>}

            {requestData.status === 'ready' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg"><FaCheckCircle className="text-amber-700 text-xl" /></div>
                  <div className="flex-1">
                    <h4 className="font-bold text-amber-900 mb-3">📦 READY FOR PICKUP!</h4>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-amber-200">
                        <p className="font-medium text-gray-800 mb-2">📍 CLAIM INSTRUCTIONS:</p>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                        
                          <li className="text-gray-700"><span className="font-medium">Go to Registrar Office</span> - Present Official Receipt and Valid ID</li>
                          <li className="text-gray-700"><span className="font-medium">Claim your document</span> - Sign the release form</li>
                        </ol>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-amber-800">
                        <FaInfoCircle className="mt-0.5 flex-shrink-0" />
                        <p>Claim within 30 days, otherwise the document will be forfeited.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {requestData.status === 'claimed' && (
              <div className="bg-[#F1F8E9] border border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><FaCheckCircle className="text-[#1B5E20] text-xl" /></div>
                  <div>
                    <h4 className="font-bold text-[#1B5E20] mb-1">✓ Document Claimed</h4>
                    <p className="text-green-800 text-sm">Your document has been successfully claimed. Thank you for using {SCHOOL.systemName}.</p>
                  </div>
                </div>
              </div>
            )}

            {requestData.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 rounded-lg"><FaExclamationTriangle className="text-red-700 text-xl" /></div>
                  <div>
                    <h4 className="font-bold text-red-900 mb-1">Request Rejected</h4>
                    <p className="text-red-800 text-sm">{requestData.rejectedReason || 'Your request was rejected. Please contact the Registrar Office for more information.'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><FaBuilding className="text-[#1B5E20]" /> Pickup Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-gray-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-sm text-gray-600">{locationInfo}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaClock className="text-gray-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Office Hours</p>
                      <p className="text-sm text-gray-600">{officeHours}</p>
                      <p className="text-xs text-amber-600">{OFFICE.schedule.closedNote}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FaPhone className="text-gray-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Contact</p>
                      <p className="text-sm text-gray-600">{contactNumber}</p>
                      <p className="text-xs text-gray-500">{contactEmail}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-[#F1F8E9] rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Required for Pickup:</p>
                <ul className="list-disc list-inside space-y-1">
                  {OFFICE.pickup.required.map((r,i)=><li key={i} className="text-sm text-gray-600">{r}</li>)}
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button onClick={() => navigate('/request')} className="flex-1 py-3 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white rounded-xl font-medium hover:opacity-90 transition">New Request</button>
              <button onClick={clearSearch} className="flex-1 py-3 border border-green-100 bg-white text-gray-700 rounded-xl font-medium hover:bg-green-50 transition">Back to All Requests</button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-green-100">
          <p className="text-xs text-gray-500 text-center">© {new Date().getFullYear()} {SCHOOL.fullName}</p>
          <p className="text-[10px] text-gray-400 text-center mt-1">{SCHOOL.footer.location} • {officeHours}</p>
        </div>
      </div>
    </div>
  )
}
