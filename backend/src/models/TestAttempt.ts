import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import User from './User';
import Theme from './Theme';
import StudySession from './StudySession';

export enum TestType {
  INITIAL = 'INITIAL',
  SCHEDULED = 'SCHEDULED',
  PRACTICE = 'PRACTICE',
  SIMULATION = 'SIMULATION',
  ADAPTIVE = 'ADAPTIVE',
}

interface AnswerDetail {
  questionId: number;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

interface TestAttemptAttributes {
  id: number;
  userId: number;
  themeId?: number;
  sessionId?: number;
  testType: TestType;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
  answers: AnswerDetail[];
  passThreshold: number;
  passed: boolean;
  adaptiveDifficulty?: number;
  weakAreas?: string[];
  strongAreas?: string[];
  aiRecommendations?: any;
  predictedExamScore?: number;
  createdAt?: Date;
}

interface TestAttemptCreationAttributes extends Optional<TestAttemptAttributes, 'id' | 'passed'> {}

class TestAttempt extends Model<TestAttemptAttributes, TestAttemptCreationAttributes> implements TestAttemptAttributes {
  public id!: number;
  public userId!: number;
  public themeId?: number;
  public sessionId?: number;
  public testType!: TestType;
  public totalQuestions!: number;
  public correctAnswers!: number;
  public score!: number;
  public timeSpent!: number;
  public answers!: AnswerDetail[];
  public passThreshold!: number;
  public passed!: boolean;
  public adaptiveDifficulty?: number;
  public weakAreas?: string[];
  public strongAreas?: string[];
  public aiRecommendations?: any;
  public predictedExamScore?: number;
  public readonly createdAt!: Date;
}

TestAttempt.init(
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
    sessionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'study_sessions',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    testType: {
      type: DataTypes.ENUM(...Object.values(TestType)),
      allowNull: false,
    },
    totalQuestions: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        min: 1,
        max: 100,
      },
    },
    correctAnswers: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    timeSpent: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: 'Tiempo en segundos',
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    passThreshold: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 70,
    },
    passed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    adaptiveDifficulty: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
      validate: {
        min: 1,
        max: 10,
      },
    },
    weakAreas: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    strongAreas: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    aiRecommendations: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    predictedExamScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
  },
  {
    sequelize,
    tableName: 'test_attempts',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        fields: ['userId', 'createdAt'],
      },
      {
        fields: ['themeId', 'testType'],
      },
      {
        fields: ['passed', 'score'],
      },
    ],
    hooks: {
      beforeCreate: (attempt: TestAttempt) => {
        // Calcular si aprobó
        attempt.passed = attempt.score >= attempt.passThreshold;
      },
      beforeUpdate: (attempt: TestAttempt) => {
        // Recalcular si aprobó
        attempt.passed = attempt.score >= attempt.passThreshold;
      },
    },
  }
);

// Relaciones
TestAttempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });
TestAttempt.belongsTo(Theme, { foreignKey: 'themeId', as: 'theme' });
TestAttempt.belongsTo(StudySession, { foreignKey: 'sessionId', as: 'session' });

User.hasMany(TestAttempt, { foreignKey: 'userId', as: 'testAttempts' });
Theme.hasMany(TestAttempt, { foreignKey: 'themeId', as: 'testAttempts' });
StudySession.hasOne(TestAttempt, { foreignKey: 'sessionId', as: 'testAttempt' });

export default TestAttempt;
