-- CreateTable
CREATE TABLE `ordenes_servicio` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `folio` VARCHAR(30) NOT NULL,
    `cliente_id` VARCHAR(191) NOT NULL,
    `equipo_id` VARCHAR(191) NOT NULL,
    `tipo_servicio_id` VARCHAR(191) NULL,
    `direccion_id` VARCHAR(191) NULL,
    `tecnico_asignado_id` VARCHAR(191) NULL,
    `modalidad` ENUM('TALLER', 'DOMICILIO') NOT NULL DEFAULT 'TALLER',
    `estado` ENUM('BORRADOR', 'RECIBIDO', 'EN_DIAGNOSTICO', 'PRESUPUESTADO', 'APROBADO', 'REPARANDO', 'LISTO', 'ENTREGADO', 'CANCELADO') NOT NULL DEFAULT 'BORRADOR',
    `prioridad` ENUM('BAJA', 'MEDIA', 'ALTA', 'URGENTE') NOT NULL DEFAULT 'MEDIA',
    `falla_reportada` TEXT NULL,
    `observaciones` TEXT NULL,
    `fecha_recepcion` DATETIME(3) NULL,
    `fecha_compromiso` DATETIME(3) NULL,
    `fecha_entrega` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ordenes_servicio_tenant_id_estado_created_at_idx`(`tenant_id`, `estado`, `created_at`),
    INDEX `ordenes_servicio_tenant_id_cliente_id_idx`(`tenant_id`, `cliente_id`),
    INDEX `ordenes_servicio_tenant_id_equipo_id_idx`(`tenant_id`, `equipo_id`),
    INDEX `ordenes_servicio_tenant_id_tecnico_asignado_id_idx`(`tenant_id`, `tecnico_asignado_id`),
    UNIQUE INDEX `ordenes_servicio_tenant_id_folio_key`(`tenant_id`, `folio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orden_estado_historial` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `orden_id` VARCHAR(191) NOT NULL,
    `estado_anterior` ENUM('BORRADOR', 'RECIBIDO', 'EN_DIAGNOSTICO', 'PRESUPUESTADO', 'APROBADO', 'REPARANDO', 'LISTO', 'ENTREGADO', 'CANCELADO') NULL,
    `estado_nuevo` ENUM('BORRADOR', 'RECIBIDO', 'EN_DIAGNOSTICO', 'PRESUPUESTADO', 'APROBADO', 'REPARANDO', 'LISTO', 'ENTREGADO', 'CANCELADO') NOT NULL,
    `comentario` TEXT NULL,
    `usuario_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `orden_estado_historial_tenant_id_orden_id_created_at_idx`(`tenant_id`, `orden_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orden_checklist_estetico` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `orden_id` VARCHAR(191) NOT NULL,
    `golpes` BOOLEAN NOT NULL DEFAULT false,
    `rayones` BOOLEAN NOT NULL DEFAULT false,
    `pantalla_rota` BOOLEAN NOT NULL DEFAULT false,
    `carcasa_danada` BOOLEAN NOT NULL DEFAULT false,
    `humedad` BOOLEAN NOT NULL DEFAULT false,
    `faltan_tornillos` BOOLEAN NOT NULL DEFAULT false,
    `notas` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orden_checklist_estetico_orden_id_key`(`orden_id`),
    INDEX `orden_checklist_estetico_tenant_id_idx`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orden_accesorios` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `orden_id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `recibido` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `orden_accesorios_tenant_id_orden_id_idx`(`tenant_id`, `orden_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ordenes_servicio` ADD CONSTRAINT `ordenes_servicio_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes_servicio` ADD CONSTRAINT `ordenes_servicio_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes_servicio` ADD CONSTRAINT `ordenes_servicio_equipo_id_fkey` FOREIGN KEY (`equipo_id`) REFERENCES `cliente_equipos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes_servicio` ADD CONSTRAINT `ordenes_servicio_tipo_servicio_id_fkey` FOREIGN KEY (`tipo_servicio_id`) REFERENCES `cat_tipos_servicio`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes_servicio` ADD CONSTRAINT `ordenes_servicio_direccion_id_fkey` FOREIGN KEY (`direccion_id`) REFERENCES `cliente_direcciones`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordenes_servicio` ADD CONSTRAINT `ordenes_servicio_tecnico_asignado_id_fkey` FOREIGN KEY (`tecnico_asignado_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orden_estado_historial` ADD CONSTRAINT `orden_estado_historial_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orden_estado_historial` ADD CONSTRAINT `orden_estado_historial_orden_id_fkey` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orden_estado_historial` ADD CONSTRAINT `orden_estado_historial_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orden_checklist_estetico` ADD CONSTRAINT `orden_checklist_estetico_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orden_checklist_estetico` ADD CONSTRAINT `orden_checklist_estetico_orden_id_fkey` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orden_accesorios` ADD CONSTRAINT `orden_accesorios_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orden_accesorios` ADD CONSTRAINT `orden_accesorios_orden_id_fkey` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_servicio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
