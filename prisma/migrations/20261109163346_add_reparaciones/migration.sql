-- CreateTable
CREATE TABLE `reparaciones` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `orden_id` VARCHAR(191) NOT NULL,
    `tecnico_id` VARCHAR(191) NOT NULL,
    `diagnostico_id` VARCHAR(191) NULL,
    `estado` ENUM('PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'BLOQUEADA') NOT NULL DEFAULT 'PENDIENTE',
    `notas` TEXT NULL,
    `fecha_inicio` DATETIME(3) NULL,
    `fecha_fin` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reparaciones_orden_id_key`(`orden_id`),
    INDEX `reparaciones_tenant_id_estado_idx`(`tenant_id`, `estado`),
    INDEX `reparaciones_tenant_id_tecnico_id_estado_idx`(`tenant_id`, `tecnico_id`, `estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reparacion_repuestos` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `reparacion_id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `descripcion` TEXT NULL,
    `cantidad` INTEGER NOT NULL DEFAULT 1,
    `costo_unitario` DECIMAL(12, 2) NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reparacion_repuestos_tenant_id_reparacion_id_idx`(`tenant_id`, `reparacion_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reparaciones` ADD CONSTRAINT `reparaciones_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reparaciones` ADD CONSTRAINT `reparaciones_orden_id_fkey` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reparaciones` ADD CONSTRAINT `reparaciones_tecnico_id_fkey` FOREIGN KEY (`tecnico_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reparaciones` ADD CONSTRAINT `reparaciones_diagnostico_id_fkey` FOREIGN KEY (`diagnostico_id`) REFERENCES `diagnosticos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reparacion_repuestos` ADD CONSTRAINT `reparacion_repuestos_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reparacion_repuestos` ADD CONSTRAINT `reparacion_repuestos_reparacion_id_fkey` FOREIGN KEY (`reparacion_id`) REFERENCES `reparaciones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
