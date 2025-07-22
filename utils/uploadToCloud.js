const axios = require('axios');
const FormData = require('form-data');

const uploadToCloud = async (fileBuffer, filename, mimetype) => {
    try {
        const formData = new FormData();
        formData.append('file', fileBuffer, {
            filename: filename,
            contentType: mimetype
        });
        
        // Await the axios request
        const response = await axios.post('https://srv694651.hstgr.cloud/storage/upload', formData, {
            headers: {
                ...formData.getHeaders(), // Fixed: use formData.getHeaders()
                'x-api-key': 'ayzenn09876@'
            }
        });
        
        return {
            success: true,
            fileUrl: response.data.fileUrl,
            message: response.data.message // Fixed: return the actual message
        };
        
    } catch (error) {
        console.error('Upload error:', error.message);
        
        return {
            success: false,
            error: error.message,
            details: error.response?.data || null
        };
    }
};
module.exports = {uploadToCloud};