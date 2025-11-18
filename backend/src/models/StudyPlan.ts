import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import User from './User';

export enum PlanStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

interface StudyPlanAttributes {
  id: number;
  userId: number;
  startDate: Date;
  examDate: Date;
  totalHours: number;
  status: PlanStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StudyPlanCreationAttributes extends Optional<StudyPlanAttributes, 'id'> {}

class StudyPlan extends Model<StudyPlanAttributes, StudyPlanCreationAttributes> implements StudyPlanAttributes {
  public id!: number;
  public userId!: number;
  public startDate!: Date;
  public examDate!: Date;
  public totalHours!: number;
  public status!: PlanStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudyPlan.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    examDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    totalHours: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PlanStatus)),
      allowNull: false,
      defaultValue: PlanStatus.ACTIVE,
    },
  },
  {
    sequelize,
    tableName: 'study_plans',
    timestamps: true,
  }
);

// Relaciones
StudyPlan.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(StudyPlan, { foreignKey: 'userId', as: 'studyPlans' });

export default StudyPlan;
