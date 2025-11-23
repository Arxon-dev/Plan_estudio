import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';

interface AnnouncementAttributes {
    id: number;
    content: string;
    type: 'info' | 'warning' | 'success' | 'error';
    link?: string;
    startDate?: Date;
    endDate?: Date;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface AnnouncementCreationAttributes extends Optional<AnnouncementAttributes, 'id'> { }

class Announcement extends Model<AnnouncementAttributes, AnnouncementCreationAttributes> implements AnnouncementAttributes {
    public id!: number;
    public content!: string;
    public type!: 'info' | 'warning' | 'success' | 'error';
    public link?: string;
    public startDate?: Date;
    public endDate?: Date;
    public isActive!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Announcement.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        content: {
            type: DataTypes.STRING(255), // Limit characters as requested
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('info', 'warning', 'success', 'error'),
            allowNull: false,
            defaultValue: 'info',
        },
        link: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'announcements',
        timestamps: true,
    }
);

export default Announcement;
