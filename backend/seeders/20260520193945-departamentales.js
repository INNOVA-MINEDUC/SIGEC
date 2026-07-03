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
      { nombre: 'Dideduc Alta Verapaz',       departamento: 'Alta Verapaz'    },
      { nombre: 'Dideduc Baja Verapaz',        departamento: 'Baja Verapaz'    },
      { nombre: 'Dideduc Chimaltenango',       departamento: 'Chimaltenango'   },
      { nombre: 'Dideduc Chiquimula',          departamento: 'Chiquimula'      },
      { nombre: 'Dideduc El Progreso',         departamento: 'El Progreso'     },
      { nombre: 'Dideduc Escuintla',           departamento: 'Escuintla'       },
      { nombre: 'Dideduc Guatemala Norte',     departamento: 'Guatemala'       },
      { nombre: 'Dideduc Guatemala Occidente', departamento: 'Guatemala'       },
      { nombre: 'Dideduc Guatemala Oriente',   departamento: 'Guatemala'       },
      { nombre: 'Dideduc Guatemala Sur',       departamento: 'Guatemala'       },
      { nombre: 'Dideduc Huehuetenango',       departamento: 'Huehuetenango'   },
      { nombre: 'Dideduc Izabal',              departamento: 'Izabal'          },
      { nombre: 'Dideduc Jalapa',              departamento: 'Jalapa'          },
      { nombre: 'Dideduc Jutiapa',             departamento: 'Jutiapa'         },
      { nombre: 'Dideduc Petén',               departamento: 'Petén'           },
      { nombre: 'Dideduc Quetzaltenango',      departamento: 'Quetzaltenango'  },
      { nombre: 'Dideduc Quiché',              departamento: 'Quiché'          },
      { nombre: 'Dideduc Retalhuleu',          departamento: 'Retalhuleu'      },
      { nombre: 'Dideduc Sacatepéquez',        departamento: 'Sacatepéquez'    },
      { nombre: 'Dideduc San Marcos',          departamento: 'San Marcos'      },
      { nombre: 'Dideduc Santa Rosa',          departamento: 'Santa Rosa'      },
      { nombre: 'Dideduc Sololá',              departamento: 'Sololá'          },
      { nombre: 'Dideduc Suchitepéquez',       departamento: 'Suchitepéquez'   },
      { nombre: 'Dideduc Totonicapán',         departamento: 'Totonicapán'     },
      { nombre: 'Dideduc Zacapa',              departamento: 'Zacapa'          },
    ];

    const rows = dideduc.map(d => ({
      departamento_id: findDeptId(d.departamento),
      nombre:          d.nombre,
      createdAt:       new Date(),
      updatedAt:       new Date()
    }));

    await queryInterface.bulkInsert('departamentales', rows, { ignoreDuplicates: true });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('departamentales', null, {});
  }
};
