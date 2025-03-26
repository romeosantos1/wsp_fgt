-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2025-03-26 03:43:12.959

-- tables
-- Table: USUARIO
CREATE TABLE USUARIO (
    ID bigint  NOT NULL AUTO_INCREMENT,
    razon_social varchar(200)  NOT NULL,
    RUC varchar(20)  NOT NULL,
    DIRECCION varchar(200)  NOT NULL,
    EMAIL varchar(200)  NOT NULL,
    token varchar(1000)  NOT NULL,
    bussines_id varchar(500) not null,
    CONSTRAINT USUARIO_pk PRIMARY KEY (ID)
);

-- Table: USUARIO_KEY
CREATE TABLE USUARIO_KEY (
    ID bigint  NOT NULL AUTO_INCREMENT,
    api_key varchar(50)  NOT NULL,
    USUARIO_ID bigint  NOT NULL,
    CONSTRAINT USUARIO_KEY_pk PRIMARY KEY (ID)
);

-- Table: compra
CREATE TABLE compra (
    id bigint  NOT NULL,
    inicio_vigencia date  NOT NULL DEFAULT current_date,
    FIN_VIGENCIA date  NOT NULL,
    USUARIO_ID bigint  NOT NULL,
    paquete_id int  NOT NULL,
    CONSTRAINT compra_pk PRIMARY KEY (id)
);

-- Table: mensaje_template
CREATE TABLE mensaje_template (
    mensaje_id bigint  NOT NULL,
    USUARIO_KEY_ID bigint  NOT NULL,
    telefono_recepcion varchar(20)  NOT NULL,
    fh_envio timestamp  NOT NULL DEFAULT current_timestamp,
    template_id_template varchar(200)  NOT NULL,
    CONSTRAINT mensaje_template_pk PRIMARY KEY (mensaje_id)
);

-- Table: paquete
CREATE TABLE paquete (
    id int  NOT NULL AUTO_INCREMENT,
    cantidad int  NOT NULL,
    precio int  NOT NULL,
    duracion int  NOT NULL,
    CONSTRAINT paquete_pk PRIMARY KEY (id)
);

-- Table: template
CREATE TABLE template (
    id_template varchar(200)  NOT NULL,
    contenido_template varchar(1040)  NOT NULL,
    CONSTRAINT template_pk PRIMARY KEY (id_template)
);

-- Table: template_etiqueta
CREATE TABLE template_etiqueta (
    id int  NOT NULL,
    mensaje_template_mensaje_id bigint  NOT NULL,
    orden_template int  NOT NULL,
    valor varchar(200)  NOT NULL,
    template_id varchar(200)  NOT NULL,
    CONSTRAINT template_etiqueta_pk PRIMARY KEY (id)
);

-- foreign keys
-- Reference: USUARIO_KEY_USUARIO (table: USUARIO_KEY)
ALTER TABLE USUARIO_KEY ADD CONSTRAINT USUARIO_KEY_USUARIO FOREIGN KEY USUARIO_KEY_USUARIO (USUARIO_ID)
    REFERENCES USUARIO (ID);

-- Reference: compra_USUARIO (table: compra)
ALTER TABLE compra ADD CONSTRAINT compra_USUARIO FOREIGN KEY compra_USUARIO (USUARIO_ID)
    REFERENCES USUARIO (ID);

-- Reference: compra_paquete (table: compra)
ALTER TABLE compra ADD CONSTRAINT compra_paquete FOREIGN KEY compra_paquete (paquete_id)
    REFERENCES paquete (id);

-- Reference: mensaje_template_USUARIO_KEY (table: mensaje_template)
ALTER TABLE mensaje_template ADD CONSTRAINT mensaje_template_USUARIO_KEY FOREIGN KEY mensaje_template_USUARIO_KEY (USUARIO_KEY_ID)
    REFERENCES USUARIO_KEY (ID);

-- Reference: mensaje_template_template (table: mensaje_template)
ALTER TABLE mensaje_template ADD CONSTRAINT mensaje_template_template FOREIGN KEY mensaje_template_template (template_id_template)
    REFERENCES template (id_template);

-- Reference: template_etiqueta_mensaje_template (table: template_etiqueta)
ALTER TABLE template_etiqueta ADD CONSTRAINT template_etiqueta_mensaje_template FOREIGN KEY template_etiqueta_mensaje_template (mensaje_template_mensaje_id)
    REFERENCES mensaje_template (mensaje_id);

-- Reference: template_etiqueta_template (table: template_etiqueta)
ALTER TABLE template_etiqueta ADD CONSTRAINT template_etiqueta_template FOREIGN KEY template_etiqueta_template (template_id)
    REFERENCES template (id_template);

-- End of file.

