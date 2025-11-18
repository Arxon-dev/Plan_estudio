import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import User from './User';
import Theme from './Theme';

interface UserNoteAttributes {
  id: number;
  userId: number;
  themeId: number;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserNoteCreationAttributes extends Optional<UserNoteAttributes, 'id'> {}

class UserNote extends Model<UserNoteAttributes, UserNoteCreationAttributes> implements UserNoteAttributes {
  public id!: number;
  public userId!: number;
  public themeId!: number;
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserNote.init(
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
      allowNull: false,
      references: {
        model: 'themes',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'user_notes',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'themeId'],
      },
    ],
  }
);

// Relaciones
UserNote.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserNote.belongsTo(Theme, { foreignKey: 'themeId', as: 'theme' });
User.hasMany(UserNote, { foreignKey: 'userId', as: 'notes' });
Theme.hasMany(UserNote, { foreignKey: 'themeId', as: 'userNotes' });

export default UserNote;
