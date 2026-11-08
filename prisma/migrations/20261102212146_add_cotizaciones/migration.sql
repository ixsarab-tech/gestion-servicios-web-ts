-- CreateTable
CREATE TABLE `cotizaciones` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `orden_id` VARCHAR(191) NOT NULL,
    `diagnostico_id` VARCHAR(191) NULL,
    `estado` ENUM('BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'VENCIDA') NOT NULL DEFAULT 'BORRADOR',
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `iva` DECIMAL(12, 2) NOT NULL,
    `total` DECIMAL(12, 2) NOT NULL,
    `moneda` VARCHAR(3) NOT NULL DEFAULT 'NIO',
    `notas` TEXT NULL,
    `valida_hasta` DATETIME(3) NULL,
    `enviada_en` DATETIME(3) NULL,
    `respondida_en` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cotizaciones_tenant_id_orden_id_created_at_idx`(`tenant_id`, `orden_id`, `created_at`),
    INDEX `cotizaciones_tenant_id_estado_idx`(`tenant_id`, `estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cotizacion_items` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `cotizacion_id` VARCHAR(191) NOT NULL,
    `concepto` VARCHAR(255) NOT NULL,
    `descripcion` TEXT NULL,
    `cantidad` DECIMAL(10, 3) NOT NULL,
    `precio_unitario` DECIMAL(12, 2) NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cotizacion_items_tenant_id_cotizacion_id_idx`(`tenant_id`, `cotizacion_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_orden_id_fkey` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_diagnostico_id_fkey` FOREIGN KEY (`diagnostico_id`) REFERENCES `diagnosticos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizacion_items` ADD CONSTRAINT `cotizacion_items_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizacion_items` ADD CONSTRAINT `cotizacion_items_cotizacion_id_fkey` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
