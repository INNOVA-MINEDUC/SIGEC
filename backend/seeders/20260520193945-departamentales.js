'use strict';

/** @type {import('sequelize-cli').Seeder} */
export default {
  async up (queryInterface, Sequelize) {

    // Obtener todos los departamentos existentes
    const departamentos = await queryInterface.sequelize.query(
      `SELECT id, nombre FROM departamentos`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Helper: busca el id del departamento por nombre (insensible a mayúsculas)
    const findDeptId = (nombre) => {
      const found = departamentos.find(
        d => d.nombre.toLowerCase().trim() === nombre.toLowerCase().trim()
      );
      if (!found) throw new Error(`Departamento no encontrado: ${nombre}`);
      return found.id;
    };

    // Cada DIDEDUC con su departamento correspondiente
    // Guatemala Norte/Sur/Oriente/Occidente → todas apuntan al depto "Guatemala"
    const dideduc = [
      { nombre: 'DIDEDUC Alta Verapaz',       departamento: 'Alta Verapaz'    },
      { nombre: 'DIDEDUC Baja Verapaz',        departamento: 'Baja Verapaz'    },
      { nombre: 'DIDEDUC Chimaltenango',       departamento: 'Chimaltenango'   },
      { nombre: 'DIDEDUC Chiquimula',          departamento: 'Chiquimula'      },
      { nombre: 'DIDEDUC El Progreso',         departamento: 'El Progreso'     },
      { nombre: 'DIDEDUC Escuintla',           departamento: 'Escuintla'       },
      { nombre: 'DIDEDUC Guatemala Norte',     departamento: 'Guatemala'       },
      { nombre: 'DIDEDUC Guatemala Occidente', departamento: 'Guatemala'       },
      { nombre: 'DIDEDUC Guatemala Oriente',   departamento: 'Guatemala'       },
      { nombre: 'DIDEDUC Guatemala Sur',       departamento: 'Guatemala'       },
      { nombre: 'DIDEDUC Huehuetenango',       departamento: 'Huehuetenango'   },
      { nombre: 'DIDEDUC Izabal',              departamento: 'Izabal'          },
      { nombre: 'DIDEDUC Jalapa',              departamento: 'Jalapa'          },
      { nombre: 'DIDEDUC Jutiapa',             departamento: 'Jutiapa'         },
      { nombre: 'DIDEDUC Petén',               departamento: 'Petén'           },
      { nombre: 'DIDEDUC Quetzaltenango',      departamento: 'Quetzaltenango'  },
      { nombre: 'DIDEDUC Quiché',              departamento: 'Quiché'          },
      { nombre: 'DIDEDUC Retalhuleu',          departamento: 'Retalhuleu'      },
      { nombre: 'DIDEDUC Sacatepéquez',        departamento: 'Sacatepéquez'    },
      { nombre: 'DIDEDUC San Marcos',          departamento: 'San Marcos'      },
      { nombre: 'DIDEDUC Santa Rosa',          departamento: 'Santa Rosa'      },
      { nombre: 'DIDEDUC Sololá',              departamento: 'Sololá'          },
      { nombre: 'DIDEDUC Suchitepéquez',       departamento: 'Suchitepéquez'   },
      { nombre: 'DIDEDUC Totonicapán',         departamento: 'Totonicapán'     },
      { nombre: 'DIDEDUC Zacapa',              departamento: 'Zacapa'          },
    ];

    const rows = dideduc.map(d => ({
      departamento_id: findDeptId(d.departamento),
      nombre:          d.nombre,
      createdAt:       new Date(),
      updatedAt:       new Date()
    }));

    await queryInterface.bulkInsert('departamentales', rows, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('departamentales', null, {});
  }
};
