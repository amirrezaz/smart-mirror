SELECT
    DATE_FORMAT(date_event_effective.calendar_date, '%Y%m%d') as event_effective_date,
    SUM(fact_subscription_event.count_events) as count_subscriptions
FROM
    dim_event_type
INNER JOIN
    fact_subscription_event
ON
    (dim_event_type.sk_event_type = fact_subscription_event.fk_event_type)
INNER JOIN
    dim_product effective_product
ON
    (effective_product.sk_product = fact_subscription_event.fk_product_effective)
INNER JOIN
    dim_date date_event_effective
ON
    (fact_subscription_event.fk_date_effective = date_event_effective.sk_date)
WHERE
    (dim_event_type.name IN('Acquisition', 'Reacquisition') AND
    date_event_effective.calendar_date <= curdate() AND
    effective_product.group IN('Premium', 'Premium Digital') AND
    DATE_FORMAT(date_event_effective.calendar_date, '%Y%m%d') >=  '{start_date}' AND
    DATE_FORMAT(date_event_effective.calendar_date, '%Y%m%d') <=  '{end_date}'
    )
GROUP BY
    DATE_FORMAT(date_event_effective.calendar_date, '%Y%m%d')
