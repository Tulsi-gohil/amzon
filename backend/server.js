const express = require("express");
const cors = require("cors");
const qs = require("qs");
const axios = require("axios");
const cheerio = require("cheerio");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar } = require("tough-cookie");

const app = express();
const PORT = 5000;
app.use(cors({
  origin: "http://187.77.184.135", // allow your frontend origin
  credentials: true
}));
 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("API running 🚀");
});
 

const jar = new CookieJar();
const client = wrapper(
  axios.create({
    jar,
    withCredentials: true,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    },
  })
);

app.get("/api/account", async (req, res) => {
  try {
    const response = await client.get(
      "https://www.amazon.in/ax/claim?openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.return_to=https%3A%2F%2Fwww.amazon.in%2F%3F%26tag%3Dgooginhydr1-21%26ref%3Dnav_ya_signin%26adgrpid%3D171770161190%26hvpone%3D%26hvptwo%3D%26hvadid%3D714840681071%26hvpos%3D%26hvnetw%3Dg%26hvrand%3D14807682158325480337%26hvqmt%3De%26hvdev%3Dc%26hvdvcmdl%3D%26hvlocint%3D%26hvlocphy%3D9062203%26hvtargid%3Dkwd-3704926535%26hydadcr%3D18657_2389208%26mcid%3Da684625856e53b7aba1406fdfbcd950e%26gad_source%3D1&policy_handle=Retail-Checkout&openid.mode=checkid_setup&openid.assoc_handle=inflex&arb=17737e69-383f-4e66-ac9f-47eb720906e9"
    );

    const $ = cheerio.load(response.data);

    const token = $('input[name="anti-csrftoken-a2z"]').val();
    const claim = $("input[name='claimCollectionWorkflow']").val();

    res.json({
      success: true,
      token,
      claim
    });
  } catch (error) {
    console.error("GET ERROR:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/user", async (req, res) => {
  const { mobile_no, token, claim } = req.body;

  try {
    const formData = qs.stringify({
      email: mobile_no,
      claimCollectionWorkflow: claim,
      "anti-csrftoken-a2z": token,
    });

    const response = await client.post(
      "https://www.amazon.in/ax/claim?openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.return_to=https%3A%2F%2Fwww.amazon.in%2F%3F%26tag%3Dgooginhydr1-21%26ref%3Dnav_ya_signin%26adgrpid%3D171770161190%26hvpone%3D%26hvptwo%3D%26hvadid%3D714840681071%26hvpos%3D%26hvnetw%3Dg%26hvrand%3D14807682158325480337%26hvqmt%3De%26hvdev%3Dc%26hvdvcmdl%3D%26hvlocint%3D%26hvlocphy%3D9062203%26hvtargid%3Dkwd-3704926535%26hydadcr%3D18657_2389208%26mcid%3Da684625856e53b7aba1406fdfbcd950e%26gad_source%3D1&policy_handle=Retail-Checkout&openid.mode=checkid_setup&openid.assoc_handle=inflex&arb=17737e69-383f-4e66-ac9f-47eb720906e9",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const result = response.data;
    let message = "unknown";
    if (result.includes("otp") || result.includes("Password")) {
      message = "account is found"
    }
    else if (result.includes("Looks like you are new to Amazon")) {
      message = "account is not found"
    }
    res.json({
      success: true,
      message,

    });
  } catch (error) {
    console.error("POST ERROR:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} (accessible via public IP)`);
});