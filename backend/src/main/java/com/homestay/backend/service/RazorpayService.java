package com.homestay.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestay.backend.exception.PaymentException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Talks to Razorpay's REST API directly (no SDK dependency needed — this is the entire
 * integration surface: create an order server-side, and verify the signature Razorpay
 * sends back after the customer pays). Keeps the project's dependency list minimal.
 *
 * Docs: https://razorpay.com/docs/api/orders/ and
 *       https://razorpay.com/docs/payments/server-integration/php/payment-gateway/build-integration/#step-3-verify-payment-signature
 */
@Service
public class RazorpayService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.razorpay.key-id}")
    private String keyId;

    @Value("${app.razorpay.key-secret}")
    private String keySecret;

    public RazorpayService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String getKeyId() {
        return keyId;
    }

    /** Creates a Razorpay order for the given amount (already computed server-side) and returns the order ID. */
    public String createOrder(long amountInPaise, String receipt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(keyId, keySecret);
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("amount", amountInPaise);
        body.put("currency", "INR");
        body.put("receipt", receipt);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.razorpay.com/v1/orders", HttpMethod.POST, request, String.class);
            JsonNode json = objectMapper.readTree(response.getBody());
            return json.get("id").asText();
        } catch (Exception e) {
            throw new PaymentException("Could not create payment order: " + e.getMessage());
        }
    }

    /**
     * Verifies the HMAC-SHA256 signature Razorpay's Checkout.js returns after a successful
     * payment. This is the step that actually proves the payment happened — never trust the
     * frontend's claim of success without this check.
     */
    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }

            return hex.toString().equals(signature);
        } catch (Exception e) {
            throw new PaymentException("Signature verification failed: " + e.getMessage());
        }
    }
}
