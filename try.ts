const axios = require('axios');
const { AxiosError } = require('axios');
const { AggregateError } = require('axios');

async function testGeneratePDFEndpoint() {
  try {
    const queryParams = {
      userName: "John",
      firstUrl: "https://www.thecolorapi.com/id?format=svg&hex=E5DAD4",
      secondUrl: "https://www.thecolorapi.com/id?format=svg&hex=E5CBD4",
      thirdUrl: "https://www.thecolorapi.com/id?format=svg&hex=F4DAC3",
      fourthUrl: "https://www.thecolorapi.com/id?format=svg&hex=B2DAD1",
      fifthUrl: "https://www.thecolorapi.com/id?format=svg&hex=E5DAD5",
      screenshotUrl: "https://puppeteer-api-iy77.onrender.com/capture-screenshot?font=merriweather",
    };

    const response = await axios.get('http://localhost:3000/generate-pdf', {
      params: queryParams,
      responseType: 'arraybuffer', // Set the response type to arraybuffer to handle binary data
    });

    console.log('PDF generated successfully');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error;
      if (axiosError.response) {
        console.error('Error generating PDF:', axiosError.response.status, axiosError.response.data);
      } else {
        console.error('Error generating PDF:', axiosError.message);
      }
    } else if (error instanceof AggregateError) {
      error.errors.forEach(err => {
        console.error('Error generating PDF:', err);
      });
    } else {
      console.error('Error generating PDF:', error);
    }
  }
}

testGeneratePDFEndpoint();
