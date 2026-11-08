-- CreateTable
CREATE TABLE `diagnosticos` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `orden_id` VARCHAR(191) NOT NULL,
    `tecnico_id` VARCHAR(191) NOT NULL,
    `estado` ENUM('BORRADOR', 'EN_PROCESO', 'COMPLETADO') NOT NULL DEFAULT 'BORRADOR',
    `pruebas_realizadas` TEXT NULL,
    `voltajes_medidos` TEXT NULL,
    `componentes_danados` TEXT NULL,
    `observaciones` TEXT NULL,
    `conclusion` TEXT NULL,
    `fecha_inicio` DATETIME(3) NULL,
    `fecha_fin` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `diagnosticos_tenant_id_orden_id_idx`(`tenant_id`, `orden_id`),
    INDEX `diagnosticos_tenant_id_tecnico_id_estado_idx`(`tenant_id`, `tecnico_id`, `estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `diagnostico_evidencias` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `diagnostico_id` VARCHAR(191) NOT NULL,
    `tipo` ENUM('FOTO', 'VIDEO', 'DOCUMENTO') NOT NULL DEFAULT 'FOTO',
    `url` VARCHAR(1000) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `diagnostico_evidencias_tenant_id_diagnostico_id_idx`(`tenant_id`, `diagnostico_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `diagnosticos` ADD CONSTRAINT `diagnosticos_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diagnosticos` ADD CONSTRAINT `diagnosticos_orden_id_fkey` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diagnosticos` ADD CONSTRAINT `diagnosticos_tecnico_id_fkey` FOREIGN KEY (`tecnico_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diagnostico_evidencias` ADD CONSTRAINT `diagnostico_evidencias_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diagnostico_evidencias` ADD CONSTRAINT `diagnostico_evidencias_diagnostico_id_fkey` FOREIGN KEY (`diagnostico_id`) REFERENCES `diagnosticos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
