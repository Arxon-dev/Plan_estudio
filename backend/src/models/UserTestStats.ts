import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import User from './User';

interface UserTestStatsAttributes {
  id: number;
  userId: number;
  totalTests: number;
  totalQuestionsAnswered: number;
  globalSuccessRate: number;
  totalTimeSpent: number;
  monthlyPracticeTests: number;
  overallMasteryLevel: number;
  examReadinessScore: number;
  strongestBlock?: string;
  weakestBlock?: string;
  averageTestSpeed: number;
  consistencyScore: number;
  userRank?: number;
  topPercentile?: number;
  lastMonthlyReset?: Date;
  updatedAt?: Date;
}

interface UserTestStatsCreationAttributes extends Optional<UserTestStatsAttributes, 'id' | 'totalTests' | 'totalQuestionsAnswered' | 'globalSuccessRate' | 'totalTimeSpent' | 'monthlyPracticeTests' | 'overallMasteryLevel' | 'examReadinessScore' | 'averageTestSpeed' | 'consistencyScore'> {}

class UserTestStats extends Model<UserTestStatsAttributes, UserTestStatsCreationAttributes> implements UserTestStatsAttributes {
  public id!: number;
  public userId!: number;
  public totalTests!: number;
  public totalQuestionsAnswered!: number;
  public globalSuccessRate!: number;
  public totalTimeSpent!: number;
  public monthlyPracticeTests!: number;
  public overallMasteryLevel!: number;
  public examReadinessScore!: number;
  public strongestBlock?: string;
  public weakestBlock?: string;
  public averageTestSpeed!: number;
  public consistencyScore!: number;
  public userRank?: number;
  public topPercentile?: number;
  public lastMonthlyReset?: Date;
  public readonly updatedAt!: Date;
}

UserTestStats.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    totalTests: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    totalQuestionsAnswered: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    globalSuccessRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    totalTimeSpent: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: 'Minutos totales',
    },
    monthlyPracticeTests: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: 'Contador para límite mensual FREE',
    },
    overallMasteryLevel: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    examReadinessScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    strongestBlock: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    weakestBlock: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    averageTestSpeed: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Segundos por pregunta',
    },
    consistencyScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    userRank: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    topPercentile: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    lastMonthlyReset: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'user_test_stats',
    timestamps: true,
    createdAt: false,
    indexes: [
      {
        unique: true,
        fields: ['userId'],
      },
      {
        fields: ['userRank'],
      },
      {
        fields: ['examReadinessScore'],
      },
    ],
  }
);

// Relaciones
UserTestStats.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(UserTestStats, { foreignKey: 'userId', as: 'testStats' });

export default UserTestStats;
