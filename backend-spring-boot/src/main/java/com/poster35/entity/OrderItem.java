package com.poster35.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "poster_id", nullable = false, length = 64)
    private String posterId;

    @Column(name = "poster_title_snapshot", nullable = false)
    private String posterTitleSnapshot;

    @Column(name = "unit_price_snapshot", nullable = false)
    private Integer unitPriceSnapshot;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "line_total", nullable = false)
    private Integer lineTotal;

    @Column(name = "image_url_snapshot", nullable = false, columnDefinition = "TEXT")
    private String imageUrlSnapshot;

    public OrderItem() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public String getPosterId() { return posterId; }
    public void setPosterId(String posterId) { this.posterId = posterId; }

    public String getPosterTitleSnapshot() { return posterTitleSnapshot; }
    public void setPosterTitleSnapshot(String posterTitleSnapshot) { this.posterTitleSnapshot = posterTitleSnapshot; }

    public Integer getUnitPriceSnapshot() { return unitPriceSnapshot; }
    public void setUnitPriceSnapshot(Integer unitPriceSnapshot) { this.unitPriceSnapshot = unitPriceSnapshot; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getLineTotal() { return lineTotal; }
    public void setLineTotal(Integer lineTotal) { this.lineTotal = lineTotal; }

    public String getImageUrlSnapshot() { return imageUrlSnapshot; }
    public void setImageUrlSnapshot(String imageUrlSnapshot) { this.imageUrlSnapshot = imageUrlSnapshot; }
}
