import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import User from './User';
import Theme from './Theme';
import TestAttempt from './TestAttempt';

export enum AdaptiveAlgorithm {
  IRT = 'IRT',
  BAYESIAN = 'BAYESIAN',
  SIMPLE = 'SIMPLE',
}

interface AITestSessionAttributes {
  id: number;
  userId: number;
  themeId?: number;
  testAttemptId: number;
  initialDifficulty: number;
  finalDifficulty: number;
  adaptiveAlgorithm: AdaptiveAlgorithm;
  aiAnalysis: any;
  generatedQuestions: number;
  personalizedFeedback: string;
  createdAt?: Date;
}

interface AITestSessionCreationAttributes extends Optional<AITestSessionAttributes, 'id' | 'generatedQuestions'> {}

class AITestSession extends Model<AITestSessionAttributes, AITestSessionCreationAttributes> implements AITestSessionAttributes {
  public id!: number;
  public userId!: number;
  public themeId?: number;
  public testAttemptId!: number;
  public initialDifficulty!: number;
  public finalDifficulty!: number;
  public adaptiveAlgorithm!: AdaptiveAlgorithm;
  public aiAnalysis!: any;
  public generatedQuestions!: number;
  public personalizedFeedback!: string;
  public readonly createdAt!: Date;
}

AITestSession.init(
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
    themeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'themes',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    testAttemptId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'test_attempts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    initialDifficulty: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false,
      validate: {
        min: 1,
        max: 10,
      },
    },
    finalDifficulty: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false,
      validate: {
        min: 1,
        max: 10,
      },
    },
    adaptiveAlgorithm: {
      type: DataTypes.ENUM(...Object.values(AdaptiveAlgorithm)),
      allowNull: false,
      defaultValue: AdaptiveAlgorithm.SIMPLE,
    },
    aiAnalysis: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    generatedQuestions: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    personalizedFeedback: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'ai_test_sessions',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        fields: ['userId', 'createdAt'],
      },
      {
        fields: ['testAttemptId'],
      },
    ],
  }
);

// Relaciones
AITestSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });
AITestSession.belongsTo(Theme, { foreignKey: 'themeId', as: 'theme' });
AITestSession.belongsTo(TestAttempt, { foreignKey: 'testAttemptId', as: 'testAttempt' });

User.hasMany(AITestSession, { foreignKey: 'userId', as: 'aiTestSessions' });
Theme.hasMany(AITestSession, { foreignKey: 'themeId', as: 'aiTestSessions' });
TestAttempt.hasOne(AITestSession, { foreignKey: 'testAttemptId', as: 'aiSession' });

export default AITestSession;
