const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Log = sequelize.define('Log', {
    request_id: {
        type: DataTypes.UUID,
        allowNull: true,
        primaryKey: true
    },
    session_key: {
        type: DataTypes.STRING,
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    ip: {
        type: DataTypes.STRING,
        allowNull: true
    },
    method: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    path: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    headers: {
        type: DataTypes.JSON,
        allowNull: true
    },
    body: {
        type: DataTypes.JSON,
        allowNull: true
    },
    query: {
        type: DataTypes.JSON,
        allowNull: true
    },
    analysis: {
        type: DataTypes.JSON,
        allowNull: true
    },
    status_code: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    response_time_ms: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'logs',
    timestamps: false
});

module.exports = Log;
