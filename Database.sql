create table brands
(
    id         varchar(6)                         not null
        primary key,
    name       varchar(150)                       not null,
    logo_url   varchar(255)                       null,
    created_at datetime default CURRENT_TIMESTAMP null,
    constraint name
        unique (name)
);

create table sports
(
    id         varchar(6)                         not null
        primary key,
    name       varchar(150)                       not null,
    created_at datetime default CURRENT_TIMESTAMP null,
    constraint name
        unique (name)
);

create table categories
(
    id         varchar(6)                         not null
        primary key,
    name       varchar(150)                       not null,
    parent_id  varchar(6)                         null,
    created_at datetime default CURRENT_TIMESTAMP null,
    sport_id   varchar(6)                         null,
    constraint fk_category_parent
        foreign key (parent_id) references categories (id)
            on delete set null,
    constraint fk_category_sport
        foreign key (sport_id) references sports (id)
            on delete set null
);

create table products
(
    id               varchar(6)                                          not null
        primary key,
    name             varchar(255)                                        not null,
    description      text                                                null,
    category_id      varchar(6)                                          not null,
    brand_id         varchar(6)                                          null,
    status           enum ('active', 'hidden') default 'active'          null,
    created_at       datetime                  default CURRENT_TIMESTAMP null,
    updated_at       datetime                  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    discount_percent int                       default 0                 null comment 'Phần trăm giảm giá (0-100%)',
    sale_start       datetime                                            null comment 'Ngày bắt đầu khuyến mãi',
    sale_end         datetime                                            null comment 'Ngày kết thúc khuyến mãi',
    constraint fk_product_brand
        foreign key (brand_id) references brands (id)
            on delete set null,
    constraint fk_product_category
        foreign key (category_id) references categories (id)
            on delete cascade
);

create table product_images
(
    id           varchar(6)           not null
        primary key,
    product_id   varchar(6)           not null,
    image_url    varchar(1000)        null,
    color        varchar(50)          null,
    is_thumbnail tinyint(1) default 0 null,
    embedding    json                 null comment 'Vector CLIP dùng cho tìm kiếm bằng hình ảnh',
    constraint fk_pi_product
        foreign key (product_id) references products (id)
            on delete cascade
);

create index product_id
    on product_images (product_id);

create table product_variants
(
    id             varchar(6)                  not null
        primary key,
    product_id     varchar(6)                  not null,
    size           varchar(50)                 not null,
    color          varchar(50)                 not null,
    price          decimal(12, 2)              not null,
    stock          int            default 0    not null,
    reserved_stock int            default 0    not null,
    import_price   decimal(10, 2) default 0.00 null,
    constraint fk_pv_product
        foreign key (product_id) references products (id)
            on delete cascade
);

create table inventory_logs
(
    id           varchar(36)                              not null
        primary key,
    variant_id   varchar(36)                              not null,
    type         enum ('import', 'export')                not null,
    quantity     int                                      not null,
    import_price decimal(10, 2) default 0.00              null,
    reference_id varchar(36)                              null,
    note         text                                     null,
    created_at   timestamp      default CURRENT_TIMESTAMP null,
    constraint inventory_logs_ibfk_1
        foreign key (variant_id) references product_variants (id)
            on delete cascade
);

create index variant_id
    on inventory_logs (variant_id);

create table users
(
    id           varchar(20)                                                   not null
        primary key,
    name         varchar(150)                                                  not null,
    email        varchar(150)                                                  not null,
    phone_number varchar(20)                                                   null,
    password     varchar(255)                                                  not null,
    gender       enum ('male', 'female', 'other')    default 'other'           null,
    avatar       varchar(255)                                                  null,
    role         enum ('customer', 'staff', 'admin') default 'customer'        not null,
    status       enum ('active', 'blocked')          default 'active'          null,
    created_at   datetime                            default CURRENT_TIMESTAMP null,
    updated_at   datetime                            default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint email
        unique (email),
    constraint phone_number
        unique (phone_number)
);

create table addresses
(
    id               varchar(6)                           not null
        primary key,
    user_id          varchar(20)                          not null,
    receiver_name    varchar(100)                         not null,
    phone_number     varchar(20)                          not null,
    shipping_address text                                 not null,
    is_default       tinyint(1) default 0                 null,
    created_at       timestamp  default CURRENT_TIMESTAMP null,
    constraint fk_addr_user
        foreign key (user_id) references users (id)
            on delete cascade
);

create table carts
(
    id         varchar(6)                         not null
        primary key,
    user_id    varchar(20)                        not null,
    created_at datetime default CURRENT_TIMESTAMP null,
    constraint fk_cart_user
        foreign key (user_id) references users (id)
            on delete cascade
);

create table cart_items
(
    id         varchar(6)    not null
        primary key,
    cart_id    varchar(6)    not null,
    product_id varchar(6)    not null,
    variant_id varchar(6)    not null,
    quantity   int default 1 not null,
    constraint unique_cart_variant
        unique (cart_id, variant_id),
    constraint fk_ci_cart
        foreign key (cart_id) references carts (id)
            on delete cascade,
    constraint fk_ci_product
        foreign key (product_id) references products (id)
            on delete cascade,
    constraint fk_ci_variant
        foreign key (variant_id) references product_variants (id)
            on delete cascade
);

create table notifications
(
    id           int auto_increment
        primary key,
    user_id      varchar(20)                          not null,
    type         varchar(50)                          not null,
    title        varchar(255)                         not null,
    message      text                                 not null,
    is_read      tinyint(1) default 0                 null,
    created_at   timestamp  default CURRENT_TIMESTAMP null,
    reference_id varchar(6)                           null,
    constraint notifications_ibfk_1
        foreign key (user_id) references users (id)
            on delete cascade
);

create index user_id
    on notifications (user_id);

create table reviews
(
    id         varchar(6)                         not null
        primary key,
    product_id varchar(6)                         not null,
    user_id    varchar(20)                        not null,
    rating     int                                null,
    comment    text                               null,
    created_at datetime default CURRENT_TIMESTAMP null,
    constraint fk_rev_product
        foreign key (product_id) references products (id)
            on delete cascade,
    constraint fk_rev_user
        foreign key (user_id) references users (id)
            on delete cascade,
    check (`rating` between 1 and 5)
);

create table stock_tickets
(
    id           varchar(36)                              not null
        primary key,
    staff_id     varchar(20)                              not null,
    supplier     varchar(255)                             null,
    note         text                                     null,
    total_items  int            default 0                 null,
    total_amount decimal(15, 2) default 0.00              null,
    created_at   timestamp      default CURRENT_TIMESTAMP null,
    constraint fk_st_staff
        foreign key (staff_id) references users (id)
            on delete cascade
);

create table vouchers
(
    id              varchar(6)                                                             not null
        primary key,
    code            varchar(50)                                                            not null,
    discount_type   enum ('percent', 'fixed_amount', 'shipping_percent', 'shipping_fixed') not null,
    discount_value  decimal(12, 2)                                                         not null,
    min_order_value decimal(12, 2) default 0.00                                            null,
    max_discount    decimal(12, 2)                                                         null,
    usage_limit     int                                                                    null,
    used_count      int            default 0                                               null,
    start_date      datetime                                                               not null,
    end_date        datetime                                                               not null,
    created_at      datetime       default CURRENT_TIMESTAMP                               null,
    constraint code
        unique (code)
);

create table orders
(
    id                  varchar(6)                                                                                    not null
        primary key,
    user_id             varchar(20)                                                                                   not null,
    staff_id            varchar(20)                                                                                   null,
    voucher_id          varchar(6)                                                                                    null,
    shipping_voucher_id varchar(6)                                                                                    null,
    subtotal            decimal(12, 2)                                                                                not null,
    shipping_fee        decimal(10, 2)                                                      default 0.00              null,
    discount_amount     decimal(12, 2)                                                      default 0.00              null,
    shipping_discount   decimal(10, 2)                                                      default 0.00              null,
    total_price         decimal(12, 2)                                                                                not null,
    receiver_name       varchar(150)                                                                                  not null,
    phone_number        varchar(20)                                                                                   not null,
    shipping_address    text                                                                                          not null,
    payment_method      enum ('Cash', 'COD', 'VNPay', 'Momo', 'BankTransfer')               default 'Cash'            null,
    payment_status      enum ('unpaid', 'paid', 'refunded')                                 default 'unpaid'          null,
    status              enum ('pending', 'confirmed', 'shipping', 'completed', 'cancelled') default 'pending'         null,
    created_at          datetime                                                            default CURRENT_TIMESTAMP null,
    updated_at          datetime                                                            default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint fk_order_shipping_voucher
        foreign key (shipping_voucher_id) references vouchers (id)
            on delete set null,
    constraint fk_order_staff
        foreign key (staff_id) references users (id)
            on delete set null,
    constraint fk_order_user
        foreign key (user_id) references users (id)
            on delete cascade,
    constraint fk_order_voucher
        foreign key (voucher_id) references vouchers (id)
            on delete set null
);

create table messages
(
    id          varchar(6)                           not null
        primary key,
    sender_id   varchar(20)                          not null,
    receiver_id varchar(20)                          not null,
    order_id    varchar(6)                           null,
    product_id  varchar(6)                           null,
    content     text                                 not null,
    is_read     tinyint(1) default 0                 null,
    created_at  datetime   default CURRENT_TIMESTAMP null,
    constraint fk_msg_order
        foreign key (order_id) references orders (id)
            on delete set null,
    constraint fk_msg_product
        foreign key (product_id) references products (id)
            on delete set null,
    constraint fk_msg_receiver
        foreign key (receiver_id) references users (id)
            on delete cascade,
    constraint fk_msg_sender
        foreign key (sender_id) references users (id)
            on delete cascade
);

create index product_id
    on messages (product_id);

create index receiver_id
    on messages (receiver_id);

create index sender_id
    on messages (sender_id);

create table order_items
(
    id         varchar(6)     not null
        primary key,
    order_id   varchar(6)     not null,
    product_id varchar(6)     not null,
    variant_id varchar(6)     not null,
    quantity   int            not null,
    price      decimal(12, 2) not null,
    constraint fk_oi_order
        foreign key (order_id) references orders (id)
            on delete cascade,
    constraint fk_oi_product
        foreign key (product_id) references products (id)
            on delete cascade,
    constraint fk_oi_variant
        foreign key (variant_id) references product_variants (id)
            on delete cascade
);

create table transactions
(
    id               varchar(6)                                                      not null
        primary key,
    order_id         varchar(6)                                                      not null,
    amount           decimal(12, 2)                                                  not null comment 'Số tiền giao dịch',
    transaction_type enum ('payment', 'refund')            default 'payment'         not null comment 'Loại: Thanh toán hoặc Hoàn tiền',
    payment_method   enum ('Cash', 'COD', 'VNPay', 'Momo', 'BankTransfer')           not null,
    status           enum ('pending', 'success', 'failed') default 'pending'         not null comment 'Trạng thái dòng tiền',
    transaction_code varchar(255)                                                    null comment 'Mã đối soát từ VNPay/Momo',
    note             text                                                            null comment 'Ghi chú (Tên khách, Lý do hoàn...)',
    created_at       datetime                              default CURRENT_TIMESTAMP null,
    updated_at       datetime                              default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint fk_trans_order
        foreign key (order_id) references orders (id)
            on delete cascade
);


