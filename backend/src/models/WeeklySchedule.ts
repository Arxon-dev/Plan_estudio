import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import StudyPlan from './StudyPlan';

interface WeeklyScheduleAttributes {
  id: number;
  studyPlanId: number;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WeeklyScheduleCreationAttributes extends Optional<WeeklyScheduleAttributes, 'id'> {}

class WeeklySchedule extends Model<WeeklyScheduleAttributes, WeeklyScheduleCreationAttributes> implements WeeklyScheduleAttributes {
  public id!: number;
  public studyPlanId!: number;
  public monday!: number;
  public tuesday!: number;
  public wednesday!: number;
  public thursday!: number;
  public friday!: number;
  public saturday!: number;
  public sunday!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WeeklySchedule.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    studyPlanId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'study_plans',
        key: 'id',
      },
      onDelete: 'CASCADE',
      unique: true,
    },
    monday: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tuesday: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 0,
    },
    wednesday: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 0,
    },
    thursday: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 0,
    },
    friday: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 0,
    },
    saturday: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 0,
    },
    sunday: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'weekly_schedules',
    timestamps: true,
  }
);

// Relaciones
WeeklySchedule.belongsTo(StudyPlan, { foreignKey: 'studyPlanId', as: 'studyPlan' });
StudyPlan.hasOne(WeeklySchedule, { foreignKey: 'studyPlanId', as: 'weeklySchedule' });

export default WeeklySchedule;
