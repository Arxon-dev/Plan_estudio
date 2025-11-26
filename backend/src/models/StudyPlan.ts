import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import WeeklySchedule from './WeeklySchedule';
import StudySession from './StudySession';

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
  methodology: 'rotation' | 'monthly-blocks';
  createdAt?: Date;
  updatedAt?: Date;
}

interface StudyPlanCreationAttributes extends Optional<StudyPlanAttributes, 'id' | 'methodology'> { }

export class StudyPlan extends Model<StudyPlanAttributes, StudyPlanCreationAttributes> implements StudyPlanAttributes {
  public id!: number;
  public userId!: number;
  public startDate!: Date;
  public examDate!: Date;
  public totalHours!: number;
  public status!: PlanStatus;
  public methodology!: 'rotation' | 'monthly-blocks';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public weeklySchedule?: WeeklySchedule;
  public sessions?: StudySession[];
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
    methodology: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'rotation',
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
// Las relaciones HasOne/HasMany se definen en index.ts normalmente, pero aquí también es útil
// StudyPlan.hasOne(WeeklySchedule, { foreignKey: 'studyPlanId', as: 'weeklySchedule' });
// StudyPlan.hasMany(StudySession, { foreignKey: 'studyPlanId', as: 'sessions' });

export default StudyPlan;
