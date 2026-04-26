const axios = require("axios");
require("dotenv").config();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com"; // Use sandbox for now

const getAccessToken = async () => {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data.access_token;
};

exports.createOrder = async (req, res) => {
  try {
    const { amount, planName } = req.body;
    const accessToken = await getAccessToken();
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            description: `${planName} Plan`,
            amount: {
              currency_code: "USD",
              value: amount.toString(),
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("PayPal Create Order Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to create order" });
  }
};

exports.captureOrder = async (req, res) => {
  try {
    const { orderID } = req.body;
    const accessToken = await getAccessToken();
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("PayPal Capture Order Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to capture order" });
  }
};
