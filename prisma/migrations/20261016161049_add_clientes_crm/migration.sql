-- CreateTable
CREATE TABLE `cat_categorias_equipo` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(80) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `es_sistema` BOOLEAN NOT NULL DEFAULT false,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cat_categorias_equipo_tenant_id_activo_idx`(`tenant_id`, `activo`),
    UNIQUE INDEX `cat_categorias_equipo_tenant_id_nombre_key`(`tenant_id`, `nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cat_marcas` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(80) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cat_marcas_tenant_id_activo_idx`(`tenant_id`, `activo`),
    UNIQUE INDEX `cat_marcas_tenant_id_nombre_key`(`tenant_id`, `nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `tipo` ENUM('FISICA', 'JURIDICA') NOT NULL DEFAULT 'FISICA',
    `rfc` VARCHAR(20) NULL,
    `razon_social` VARCHAR(200) NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `apellidos` VARCHAR(120) NULL,
    `email` VARCHAR(255) NULL,
    `telefono` VARCHAR(32) NOT NULL,
    `telefono_alternativo` VARCHAR(32) NULL,
    `fecha_nacimiento` DATE NULL,
    `notas` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `clientes_tenant_id_activo_deleted_at_idx`(`tenant_id`, `activo`, `deleted_at`),
    INDEX `clientes_tenant_id_telefono_idx`(`tenant_id`, `telefono`),
    INDEX `clientes_tenant_id_nombre_apellidos_idx`(`tenant_id`, `nombre`, `apellidos`),
    UNIQUE INDEX `clientes_tenant_id_rfc_key`(`tenant_id`, `rfc`),
    UNIQUE INDEX `clientes_tenant_id_email_key`(`tenant_id`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cliente_direcciones` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `cliente_id` VARCHAR(191) NOT NULL,
    `etiqueta` VARCHAR(50) NOT NULL,
    `calle` VARCHAR(255) NOT NULL,
    `ciudad` VARCHAR(100) NOT NULL,
    `departamento` VARCHAR(100) NULL,
    `pais` CHAR(2) NOT NULL DEFAULT 'NI',
    `codigo_postal` VARCHAR(20) NULL,
    `referencias` TEXT NULL,
    `latitud` DOUBLE NULL,
    `longitud` DOUBLE NULL,
    `es_principal` BOOLEAN NOT NULL DEFAULT false,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cliente_direcciones_tenant_id_cliente_id_activo_idx`(`tenant_id`, `cliente_id`, `activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cliente_equipos` (
    `id` VARCHAR(191) NOT NULL,
    `tenant_id` VARCHAR(191) NOT NULL,
    `cliente_id` VARCHAR(191) NOT NULL,
    `categoria_id` VARCHAR(191) NULL,
    `marca_id` VARCHAR(191) NULL,
    `modelo` VARCHAR(120) NULL,
    `numero_serie` VARCHAR(80) NULL,
    `descripcion` TEXT NULL,
    `fecha_adquisicion` DATE NULL,
    `observaciones` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cliente_equipos_tenant_id_cliente_id_activo_idx`(`tenant_id`, `cliente_id`, `activo`),
    UNIQUE INDEX `cliente_equipos_tenant_id_numero_serie_key`(`tenant_id`, `numero_serie`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cat_categorias_equipo` ADD CONSTRAINT `cat_categorias_equipo_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cat_marcas` ADD CONSTRAINT `cat_marcas_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clientes` ADD CONSTRAINT `clientes_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente_direcciones` ADD CONSTRAINT `cliente_direcciones_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente_direcciones` ADD CONSTRAINT `cliente_direcciones_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente_equipos` ADD CONSTRAINT `cliente_equipos_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente_equipos` ADD CONSTRAINT `cliente_equipos_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente_equipos` ADD CONSTRAINT `cliente_equipos_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `cat_categorias_equipo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente_equipos` ADD CONSTRAINT `cliente_equipos_marca_id_fkey` FOREIGN KEY (`marca_id`) REFERENCES `cat_marcas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
