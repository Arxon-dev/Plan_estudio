import sequelize from '@config/database'

async function run() {
  try {
    await sequelize.authenticate()
    await sequelize.query(
      'ALTER TABLE `study_sessions` ADD COLUMN `subThemeLabel` VARCHAR(500) NULL, ADD COLUMN `subThemeIndex` INT NULL;'
    )
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

run()