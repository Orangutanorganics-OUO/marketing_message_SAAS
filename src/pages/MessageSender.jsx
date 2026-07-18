import { useState } from 'react'

function MessageSender() {
  const [accessToken, setAccessToken] = useState('EAALEZCiRf7cMBR2oayF4lIBKPzls7nXdfMmG3RJZAl7h2vYg9rhTsYNTkp8DmUZCwi1Sfo9fZB18wdY8qExZC5IhZBjk5Tbz2ay3kjxv94mMWRmMFPCwrZABZCKhgGs1PGnZBvDuDkhEHzZC4vIICnJwZBqZCEZCuA3wsVtmxVwSA15XZBYmOKSHZCZAmq3KDXDnrWaNtAZDZD')
  const [phoneNumberId, setPhoneNumberId] = useState('730709853450957')
  const [templateName, setTemplateName] = useState('ny2026')
  const [languageCode, setLanguageCode] = useState('en')
  const [mediaId, setMediaId] = useState('876543219876543')
  const [csvData, setCsvData] = useState('Name,MobileNumber\nlogesh,918056779031\nsamrat,918334980100')

  const [mediaType, setMediaType] = useState('image')
  const [includeName, setIncludeName] = useState(true)
  const [messageType, setMessageType] = useState('regular') // 'regular' or 'carousel'
  const [carouselCardCount, setCarouselCardCount] = useState(2)
  const [carouselMediaIds, setCarouselMediaIds] = useState(['', ''])

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0 })

  const handleCarouselCardCountChange = (value) => {
    const count = Math.min(Math.max(parseInt(value) || 2, 2), 10)
    setCarouselCardCount(count)
    setCarouselMediaIds(prev => {
      const updated = [...prev]
      while (updated.length < count) updated.push('')
      return updated.slice(0, count)
    })
  }

  const handleCarouselMediaIdChange = (index, value) => {
    setCarouselMediaIds(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim())

    if (!headers.includes('Name') || !headers.includes('MobileNumber')) {
      throw new Error('CSV must contain "Name" and "MobileNumber" columns')
    }

    const recipients = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length >= 2 && values[0] && values[1]) {
        recipients.push({
          name: values[0],
          mobileNumber: values[1],
        })
      }
    }

    return recipients
  }

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }])
  }

  const sendMessage = async (recipient) => {
    const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`

    let mobileNumber = recipient.mobileNumber
    if (!mobileNumber.startsWith('+')) {
      mobileNumber = `+${mobileNumber}`
    }

    let components = []

    if (messageType === 'carousel') {
      if (includeName) {
        components.push({
          type: 'body',
          parameters: [{ type: 'text', text: recipient.name }],
        })
      }
      components.push({
        type: 'carousel',
        cards: carouselMediaIds.map((mId, i) => ({
          card_index: i,
          components: [
            {
              type: 'header',
              parameters: [{ type: 'image', image: { id: mId } }],
            },
          ],
        })),
      })
    } else {
      components.push({
        type: 'header',
        parameters: [
          {
            type: mediaType,
            [mediaType]: { id: mediaId },
          },
        ],
      })
      if (includeName) {
        components.push({
          type: 'body',
          parameters: [{ type: 'text', text: recipient.name }],
        })
      }
    }

    const payload = {
      messaging_product: 'whatsapp',
      to: mobileNumber,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        addLog(`✓ Sent to ${mobileNumber} (${recipient.name}) - Status: ${response.status}`, 'success')
        setStats(prev => ({ ...prev, sent: prev.sent + 1 }))
        return { success: true, data }
      } else {
        const errorMsg = data.error?.message || 'Unknown error'
        addLog(`✗ Failed to send to ${mobileNumber} (${recipient.name}) - Error: ${errorMsg}`, 'error')
        setStats(prev => ({ ...prev, failed: prev.failed + 1 }))
        return { success: false, error: errorMsg }
      }
    } catch (err) {
      addLog(`✗ Error sending to ${mobileNumber} (${recipient.name}) - ${err.message}`, 'error')
      setStats(prev => ({ ...prev, failed: prev.failed + 1 }))
      return { success: false, error: err.message }
    }
  }

  const sendBatchMessages = async () => {
    if (!accessToken || accessToken === 'EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      addLog('Please enter a valid Access Token', 'error')
      return
    }

    if (!phoneNumberId || phoneNumberId === '123456789012345') {
      addLog('Please enter a valid Phone Number ID', 'error')
      return
    }

    if (messageType === 'carousel') {
      if (carouselMediaIds.some(id => !id.trim())) {
        addLog('Please enter Media IDs for all carousel cards', 'error')
        return
      }
    } else {
      if (!mediaId || mediaId === '876543219876543') {
        addLog('Please enter a valid Media ID', 'error')
        return
      }
    }

    try {
      const recipients = parseCSV(csvData)

      if (recipients.length === 0) {
        addLog('No valid recipients found in CSV data', 'error')
        return
      }

      setLoading(true)
      setLogs([])
      setProgress(0)
      setStats({ total: recipients.length, sent: 0, failed: 0 })

      addLog(`Starting to send messages to ${recipients.length} recipients...`, 'info')
      if (messageType === 'carousel') {
        addLog(`Configuration: CAROUSEL (${carouselCardCount} cards) ${includeName ? 'with' : 'without'} name`, 'info')
      } else {
        addLog(`Configuration: ${mediaType.toUpperCase()} ${includeName ? 'with' : 'without'} name`, 'info')
      }

      const BATCH_SIZE = 5
      const DELAY_BETWEEN_BATCHES = 1000

      for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const batch = recipients.slice(i, i + BATCH_SIZE)

        await Promise.all(
          batch.map((recipient, batchIndex) =>
            sendMessage(recipient, i + batchIndex, recipients.length)
          )
        )

        const completed = Math.min(i + BATCH_SIZE, recipients.length)
        setProgress((completed / recipients.length) * 100)

        if (i + BATCH_SIZE < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
        }
      }

      setProgress(100)
      addLog('✓ All messages processed!', 'success')
    } catch (err) {
      addLog(`Error: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Send Messages</h1>
      <p className="page-description">
        Send WhatsApp template messages with media to multiple recipients. Paste your CSV data below.
      </p>

      <div className="form-group">
        <label className="form-label">Access Token</label>
        <input
          type="text"
          className="form-input"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          placeholder="Enter your WhatsApp Business API Access Token"
          disabled={loading}
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
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Template Name</label>
        <input
          type="text"
          className="form-input"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="e.g., carousel_template_5"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Language Code</label>
        <input
          type="text"
          className="form-input"
          value={languageCode}
          onChange={(e) => setLanguageCode(e.target.value)}
          placeholder="e.g., en, es, hi"
          disabled={loading}
        />
      </div>

      <div className="message-options">
        <div className="option-group">
          <label className="form-label">Message Type</label>
          <div className="radio-group">
            <input
              type="radio"
              id="regular"
              name="messageType"
              value="regular"
              checked={messageType === 'regular'}
              onChange={() => setMessageType('regular')}
              className="radio-input"
              disabled={loading}
            />
            <label htmlFor="regular" className="radio-label">Regular Template</label>
          </div>
          <div className="radio-group">
            <input
              type="radio"
              id="carousel"
              name="messageType"
              value="carousel"
              checked={messageType === 'carousel'}
              onChange={() => setMessageType('carousel')}
              className="radio-input"
              disabled={loading}
            />
            <label htmlFor="carousel" className="radio-label">Carousel Template</label>
          </div>
        </div>

        <div className="option-group">
          <label className="form-label">Include Name</label>
          <div className="radio-group">
            <input
              type="radio"
              id="withName"
              name="includeName"
              value="true"
              checked={includeName === true}
              onChange={() => setIncludeName(true)}
              className="radio-input"
              disabled={loading}
            />
            <label htmlFor="withName" className="radio-label">With Name</label>
          </div>
          <div className="radio-group">
            <input
              type="radio"
              id="withoutName"
              name="includeName"
              value="false"
              checked={includeName === false}
              onChange={() => setIncludeName(false)}
              className="radio-input"
              disabled={loading}
            />
            <label htmlFor="withoutName" className="radio-label">Without Name</label>
          </div>
        </div>

        {messageType === 'regular' && (
          <div className="option-group">
            <label className="form-label">Media Type</label>
            <div className="radio-group">
              <input
                type="radio"
                id="image"
                name="mediaType"
                value="image"
                checked={mediaType === 'image'}
                onChange={(e) => setMediaType(e.target.value)}
                className="radio-input"
                disabled={loading}
              />
              <label htmlFor="image" className="radio-label">Image</label>
            </div>
            <div className="radio-group">
              <input
                type="radio"
                id="video"
                name="mediaType"
                value="video"
                checked={mediaType === 'video'}
                onChange={(e) => setMediaType(e.target.value)}
                className="radio-input"
                disabled={loading}
              />
              <label htmlFor="video" className="radio-label">Video</label>
            </div>
          </div>
        )}
      </div>

      {messageType === 'regular' && (
        <div className="form-group">
          <label className="form-label">Media ID</label>
          <input
            type="text"
            className="form-input"
            value={mediaId}
            onChange={(e) => setMediaId(e.target.value)}
            placeholder="Enter the Media ID from Media Upload page"
            disabled={loading}
          />
        </div>
      )}

      {messageType === 'carousel' && (
        <>
          <div className="form-group">
            <label className="form-label">Number of Carousel Cards</label>
            <input
              type="number"
              className="form-input"
              value={carouselCardCount}
              onChange={(e) => handleCarouselCardCountChange(e.target.value)}
              min={2}
              max={10}
              disabled={loading}
              style={{ width: '120px' }}
            />
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
              Min 2, Max 10. Must match the number of cards in your carousel template.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Carousel Card Media IDs (Images)</label>
            {carouselMediaIds.map((mId, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '4px' }}>
                  Card {index + 1} Image Media ID
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={mId}
                  onChange={(e) => handleCarouselMediaIdChange(index, e.target.value)}
                  placeholder={`Enter image Media ID for card ${index + 1}`}
                  disabled={loading}
                />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="csv-editor form-group">
        <label className="form-label">CSV Data (Name, MobileNumber)</label>
        <textarea
          className="csv-textarea"
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder="Name,MobileNumber&#10;John,919876543210&#10;Jane,918765432109"
          disabled={loading}
        />
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
          Format: First line must be "Name,MobileNumber". Include country code in mobile numbers.
          {!includeName && ' Name column is required in CSV but will not be sent in the template.'}
        </p>
      </div>

      <button
        className="button"
        onClick={sendBatchMessages}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="loading-spinner"></span>
            <span style={{ marginLeft: '10px' }}>Sending Messages...</span>
          </>
        ) : (
          'Send Messages'
        )}
      </button>

      {(loading || stats.total > 0) && (
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}>
              {Math.round(progress)}%
            </div>
          </div>
          <div className="progress-stats">
            <span>Total: {stats.total}</span>
            <span>Sent: {stats.sent}</span>
            <span>Failed: {stats.failed}</span>
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div className="log-container">
          <h3 style={{ marginBottom: '10px' }}>Logs</h3>
          {logs.map((log, index) => (
            <div key={index} className={`log-entry ${log.type}`}>
              <strong>[{log.timestamp}]</strong> {log.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MessageSender
