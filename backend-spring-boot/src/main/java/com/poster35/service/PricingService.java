package com.poster35.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PricingService {

    @Value("${poster35.pricing.default-price:35}")
    private int defaultPosterPrice;

    @Value("${poster35.pricing.delivery-fee:0}")
    private int standardDeliveryFee;

    @Value("${poster35.pricing.free-threshold:0}")
    private int freeDeliveryThreshold;

    public record PricingResult(
            int totalQuantity,
            int unitPrice,
            int subtotal,
            int deliveryFee,
            int grandTotal,
            boolean isFreeDelivery,
            int amountForFreeDelivery
    ) {}

    /**
     * Exact business formula:
     * Subtotal = Total Quantity * ₹35
     * Delivery: 100% Free on all orders (₹0).
     */
    public PricingResult calculate(int quantity, int unitPrice, String fulfilmentType) {
        int price = unitPrice > 0 ? unitPrice : defaultPosterPrice;
        int subtotal = quantity * price;

        boolean isFree = true;
        int fee = 0;
        int grandTotal = subtotal;
        int needed = 0;

        return new PricingResult(
                quantity,
                price,
                subtotal,
                fee,
                grandTotal,
                isFree,
                needed
        );
    }
}
