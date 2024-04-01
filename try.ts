const axios = require('axios');
const { AxiosError } = require('axios');
const { AggregateError } = require('axios');

async function testGeneratePDFEndpoint() {
  try {
    const queryParams = {
      userName: "John Doe",
      firstUrl: "https://www.thecolorapi.com/id?format=svg&hex=E5DAD4",
      secondUrl: "https://www.thecolorapi.com/id?format=svg&hex=E5CBD4",
      thirdUrl: "https://www.thecolorapi.com/id?format=svg&hex=F4DAC3",
      fourthUrl: "https://www.thecolorapi.com/id?format=svg&hex=B2DAD1",
      fifthUrl: "https://www.thecolorapi.com/id?format=svg&hex=E5DAD5",
      firstRGB: "rgb(229, 218, 212)",
      secondRGB: "rgb(229, 203, 212)",
      thirdRGB: "rgb(244, 218, 195)",
      fourthRGB: "rgb(178, 218, 209)",
      fifthRGB: "rgb(229, 218, 213)",
      firstHex: "#E5DAD4",
      secondHex: "#E5CBD4",
      thirdHex: "#F4DAC3",
      fourthHex: "#B2DAD1",
      fifthHex: "#E5DAD5",
      firstCMYK: "0, 5, 7, 10",
      secondCMYK: "0, 11, 7, 10",
      thirdCMYK: "0, 11, 16, 24",
      fourthCMYK: "18, 0, 7, 10",
      fifthCMYK: "0, 5, 6, 9",
      screenshotUrl: "https://puppeteer-api-iy77.onrender.com/capture-screenshot?font=Merriweather",
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
