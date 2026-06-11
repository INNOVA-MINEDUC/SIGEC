'use strict'

/** @type {import('sequelize-cli').Migration} */

export default {
  async up (queryInterface, Sequelize) {
    // =====================================================
    // TABLA: departamentos
    // =====================================================
    await queryInterface.createTable('departamentos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    })

    // =====================================================
    // TABLA: departamentos
    // =====================================================
    await queryInterface.createTable('departamentales', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      departamento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'departamentos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    })

    // =====================================================
    // TABLA: municipios
    // =====================================================
    await queryInterface.createTable('municipios', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      departamento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'departamentos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    })

    await queryInterface.addIndex('municipios', ['departamento_id', 'nombre'], {
      unique: true,
      name: 'uniq_municipios_departamento_nombre'
    })

    // =====================================================
    // TABLA: roles
    // =====================================================
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    })

    // =====================================================
    // TABLA: users
    // =====================================================
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    })

    // =====================================================
    // TABLA: centros_educativos
    // =====================================================
    await queryInterface.createTable('centros_educativos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      codigo_udi: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      direccion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      municipio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'municipios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      sector: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      jornada: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      area: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    })

    // =====================================================
    // TABLA: ninas
    // =====================================================
    await queryInterface.createTable('ninas', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      cui: {
        type: Sequelize.STRING(20),
        allowNull: true,   // puede venir sin CUI en el archivo; NULL no viola unique
        unique: true
      },
      nombre_completo: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      fecha_nacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      edad: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      direccion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      municipio_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'municipios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      pueblo: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      comunidad_linguistica: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    })

    // =====================================================
    // NUEVA TABLA: cargas_archivos
    // =====================================================
    await queryInterface.createTable('cargas_archivos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      nombre_archivo: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      // ruta_archivo: {
      //   type: Sequelize.TEXT,
      //   allowNull: true
      // },
      total_registros: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      registros_nuevos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      registros_duplicados: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      // registros_error: {
      //   type: Sequelize.INTEGER,
      //   allowNull: false,
      //   defaultValue: 0
      // },
      fecha_carga: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      // estado: {
      //   type: Sequelize.STRING(50),
      //   allowNull: false,
      //   defaultValue: 'procesando'
      // },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    })

    // =====================================================
    // TABLA: casos_embarazo
    // =====================================================
    await queryInterface.createTable('casos_embarazo', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      numero_caso: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      nina_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ninas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      carga_archivo_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'cargas_archivos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      fecha_ingreso: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      fecha_primera_consulta: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      forma_deteccion: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      departamental_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departamentales',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      no_notificacion: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      institucion: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      queja: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      estado: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'pendiente'
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    })

    // =====================================================
    // TABLA: historial_educativo
    // =====================================================
    await queryInterface.createTable('historial_educativo', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      nina_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ninas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      centro_educativo_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'centros_educativos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      codigo_personal: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      status_actual: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      grado: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      nivel: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      resultado: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      anio: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    })
  },

  async down (queryInterface, Sequelize) {
    // orden inverso a la creación, respetando dependencias de FK
    await queryInterface.dropTable('historial_educativo')
    await queryInterface.dropTable('casos_embarazo')
    await queryInterface.dropTable('cargas_archivos')
    await queryInterface.dropTable('ninas')
    await queryInterface.dropTable('centros_educativos')
    await queryInterface.dropTable('users')
    await queryInterface.dropTable('roles')
    await queryInterface.dropTable('municipios')
    await queryInterface.dropTable('departamentales')
    await queryInterface.dropTable('departamentos')
  }
}