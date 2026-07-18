import { useState } from 'react'

function MediaUpload() {
  const [accessToken, setAccessToken] = useState('EAALEZCiRf7cMBR2oayF4lIBKPzls7nXdfMmG3RJZAl7h2vYg9rhTsYNTkp8DmUZCwi1Sfo9fZB18wdY8qExZC5IhZBjk5Tbz2ay3kjxv94mMWRmMFPCwrZABZCKhgGs1PGnZBvDuDkhEHzZC4vIICnJwZBqZCEZCuA3wsVtmxVwSA15XZBYmOKSHZCZAmq3KDXDnrWaNtAZDZD')
  const [phoneNumberId, setPhoneNumberId] = useState('730709853450957')
  const [selectedFile, setSelectedFile] = useState(null)
  const [mediaType, setMediaType] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)

      // Determine media type based on file
      const fileType = file.type
      if (fileType.startsWith('image/')) {
        setMediaType(fileType === 'image/png' ? 'image/png' : 'image/jpeg')
      } else if (fileType.startsWith('video/')) {
        setMediaType('video/mp4')
      } else {
        setMediaType(fileType)
      }

      setError(null)
      setResult(null)
    }
  }

  const uploadMedia = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload')
      return
    }

    if (!accessToken || accessToken === 'EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      setError('Please enter a valid Access Token')
      return
    }

    if (!phoneNumberId || phoneNumberId === '123456789012345') {
      setError('Please enter a valid Phone Number ID')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/media`

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('type', mediaType)
      formData.append('messaging_product', 'whatsapp')

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.id) {
        setResult({
          success: true,
          mediaId: data.id,
          message: 'Media uploaded successfully!',
        })
      } else {
        setError(data.error?.message || 'Failed to upload media. Please check your credentials and try again.')
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Media Upload</h1>
      <p className="page-description">
        Upload images or videos to WhatsApp Business API and get a Media ID for sending messages.
      </p>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && result.success && (
        <div className="alert alert-success">
          <strong>Success!</strong> {result.message}
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff', borderRadius: '5px' }}>
            <strong>Media ID:</strong> <code>{result.mediaId}</code>
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Access Token</label>
        <input
          type="text"
          className="form-input"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          placeholder="Enter your WhatsApp Business API Access Token"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Phone Number ID</label>
        <input
          type="text"
          className="form-input"
          value={phoneNumberId}
          onChange={(e) => setPhoneNumberId(e.target.value)}
          placeholder="Enter your WhatsApp Business Phone Number ID"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Upload Media (Image or Video)</label>
        <div className={`file-input-container ${selectedFile ? 'has-file' : ''}`}>
          <input
            type="file"
            id="file-input"
            className="file-input"
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          <label htmlFor="file-input" className="file-label">
            {selectedFile ? (
              <div>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" style={{ margin: '0 auto' }}>
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                <p style={{ marginTop: '10px', color: '#25D366', fontWeight: 'bold' }}>File selected</p>
              </div>
            ) : (
              <div>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#128C7E" strokeWidth="2" style={{ margin: '0 auto' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p style={{ marginTop: '10px' }}>Click to select a file or drag and drop</p>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>Supported: Images (PNG, JPEG) and Videos (MP4)</p>
              </div>
            )}
          </label>
        </div>
        {selectedFile && (
          <div className="selected-file">
            <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            <br />
            <strong>Type:</strong> {mediaType}
          </div>
        )}
      </div>

      <button
        className="button"
        onClick={uploadMedia}
        disabled={loading || !selectedFile}
      >
        {loading ? (
          <>
            <span className="loading-spinner"></span>
            <span style={{ marginLeft: '10px' }}>Uploading...</span>
          </>
        ) : (
          'Get Media ID'
        )}
      </button>
    </div>
  )
}

export default MediaUpload
