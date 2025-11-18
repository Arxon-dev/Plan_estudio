import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import StudyPlan from './StudyPlan';
import Theme from './Theme';

interface PlanThemeStatsAttributes {
  id: number;
  studyPlanId: number;
  themeId: number;
  easeFactor: number; // SM-2 EF, mínimo ~1.3
  intervalDays: number; // intervalo actual en días
  lastReviewedAt?: Date;
  successRate: number; // 0-1
  totalReviews: number;
  totalHoursSpent: number; // acumulado
  createdAt?: Date;
  updatedAt?: Date;
}

interface PlanThemeStatsCreationAttributes extends Optional<PlanThemeStatsAttributes, 'id'> {}

class PlanThemeStats extends Model<PlanThemeStatsAttributes, PlanThemeStatsCreationAttributes> implements PlanThemeStatsAttributes {
  public id!: number;
  public studyPlanId!: number;
  public themeId!: number;
  public easeFactor!: number;
  public intervalDays!: number;
  public lastReviewedAt?: Date;
  public successRate!: number;
  public totalReviews!: number;
  public totalHoursSpent!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PlanThemeStats.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    studyPlanId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'study_plans', key: 'id' },
      onDelete: 'CASCADE',
    },
    themeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'themes', key: 'id' },
      onDelete: 'CASCADE',
    },
    easeFactor: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 2.5,
    },
    intervalDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    lastReviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    successRate: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 1.0,
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalHoursSpent: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'plan_theme_stats',
    timestamps: true,
    indexes: [
      { fields: ['studyPlanId', 'themeId'], unique: true },
    ],
  }
);

PlanThemeStats.belongsTo(StudyPlan, { foreignKey: 'studyPlanId', as: 'studyPlan' });
PlanThemeStats.belongsTo(Theme, { foreignKey: 'themeId', as: 'theme' });
StudyPlan.hasMany(PlanThemeStats, { foreignKey: 'studyPlanId', as: 'themeStats' });
Theme.hasMany(PlanThemeStats, { foreignKey: 'themeId', as: 'themeStats' });

export default PlanThemeStats;