// biome-ignore-all lint/suspicious/noTemplateCurlyInString: Docker env var placeholders use ${VAR} syntax intentionally
import type { DatabaseTemplate } from './types'

/**
 * Database templates for common database services
 * These provide sensible defaults for deploying database containers
 */
export const databaseTemplates: DatabaseTemplate[] = [
  {
    id: 'postgres-16',
    name: 'PostgreSQL 16',
    description: "The world's most advanced open source relational database",
    category: 'database',
    databaseType: 'postgres',
    sourceType: 'image',
    sourceConfig: { image: 'postgres', tag: '16-alpine' },
    defaultEnvVars: {
      POSTGRES_USER: '${MIZU_DB_USER}',
      POSTGRES_PASSWORD: '${MIZU_DB_PASSWORD}',
      POSTGRES_DB: '${MIZU_DB_NAME}',
    },
    defaultPorts: [{ container: 5432 }],
    defaultCredentials: {
      usernameEnvVar: 'POSTGRES_USER',
      passwordEnvVar: 'POSTGRES_PASSWORD',
      databaseEnvVar: 'POSTGRES_DB',
    },
    healthCheck: {
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}'],
      interval: '10s',
      timeout: '5s',
      retries: 5,
    },
  },
  {
    id: 'postgres-15',
    name: 'PostgreSQL 15',
    description: 'PostgreSQL 15 - stable and widely supported',
    category: 'database',
    databaseType: 'postgres',
    sourceType: 'image',
    sourceConfig: { image: 'postgres', tag: '15-alpine' },
    defaultEnvVars: {
      POSTGRES_USER: '${MIZU_DB_USER}',
      POSTGRES_PASSWORD: '${MIZU_DB_PASSWORD}',
      POSTGRES_DB: '${MIZU_DB_NAME}',
    },
    defaultPorts: [{ container: 5432 }],
    defaultCredentials: {
      usernameEnvVar: 'POSTGRES_USER',
      passwordEnvVar: 'POSTGRES_PASSWORD',
      databaseEnvVar: 'POSTGRES_DB',
    },
    healthCheck: {
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}'],
      interval: '10s',
      timeout: '5s',
      retries: 5,
    },
  },
  {
    id: 'mysql-8',
    name: 'MySQL 8',
    description: "The world's most popular open source database",
    category: 'database',
    databaseType: 'mysql',
    sourceType: 'image',
    sourceConfig: { image: 'mysql', tag: '8' },
    defaultEnvVars: {
      MYSQL_ROOT_PASSWORD: '${MIZU_DB_ROOT_PASSWORD}',
      MYSQL_DATABASE: '${MIZU_DB_NAME}',
      MYSQL_USER: '${MIZU_DB_USER}',
      MYSQL_PASSWORD: '${MIZU_DB_PASSWORD}',
    },
    defaultPorts: [{ container: 3306 }],
    defaultCredentials: {
      usernameEnvVar: 'MYSQL_USER',
      passwordEnvVar: 'MYSQL_PASSWORD',
      databaseEnvVar: 'MYSQL_DATABASE',
      rootPasswordEnvVar: 'MYSQL_ROOT_PASSWORD',
    },
    healthCheck: {
      test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost'],
      interval: '10s',
      timeout: '5s',
      retries: 5,
    },
  },
  {
    id: 'redis-7',
    name: 'Redis 7',
    description: 'In-memory data structure store, cache, and message broker',
    category: 'database',
    databaseType: 'redis',
    sourceType: 'image',
    sourceConfig: { image: 'redis', tag: '7-alpine' },
    defaultEnvVars: {},
    defaultPorts: [{ container: 6379 }],
    defaultCredentials: {
      usernameEnvVar: '',
      passwordEnvVar: '',
    },
    healthCheck: {
      test: ['CMD', 'redis-cli', 'ping'],
      interval: '10s',
      timeout: '5s',
      retries: 5,
    },
  },
  {
    id: 'mongodb-7',
    name: 'MongoDB 7',
    description: 'Document-oriented NoSQL database',
    category: 'database',
    databaseType: 'mongodb',
    sourceType: 'image',
    sourceConfig: { image: 'mongo', tag: '7' },
    defaultEnvVars: {
      MONGO_INITDB_ROOT_USERNAME: '${MIZU_DB_USER}',
      MONGO_INITDB_ROOT_PASSWORD: '${MIZU_DB_PASSWORD}',
      MONGO_INITDB_DATABASE: '${MIZU_DB_NAME}',
    },
    defaultPorts: [{ container: 27017 }],
    defaultCredentials: {
      usernameEnvVar: 'MONGO_INITDB_ROOT_USERNAME',
      passwordEnvVar: 'MONGO_INITDB_ROOT_PASSWORD',
      databaseEnvVar: 'MONGO_INITDB_DATABASE',
    },
    healthCheck: {
      test: ['CMD', 'mongosh', '--eval', "db.adminCommand('ping')"],
      interval: '10s',
      timeout: '5s',
      retries: 5,
    },
  },
  {
    id: 'mariadb-11',
    name: 'MariaDB 11',
    description: 'Community-developed fork of MySQL',
    category: 'database',
    databaseType: 'mariadb',
    sourceType: 'image',
    sourceConfig: { image: 'mariadb', tag: '11' },
    defaultEnvVars: {
      MARIADB_ROOT_PASSWORD: '${MIZU_DB_ROOT_PASSWORD}',
      MARIADB_DATABASE: '${MIZU_DB_NAME}',
      MARIADB_USER: '${MIZU_DB_USER}',
      MARIADB_PASSWORD: '${MIZU_DB_PASSWORD}',
    },
    defaultPorts: [{ container: 3306 }],
    defaultCredentials: {
      usernameEnvVar: 'MARIADB_USER',
      passwordEnvVar: 'MARIADB_PASSWORD',
      databaseEnvVar: 'MARIADB_DATABASE',
      rootPasswordEnvVar: 'MARIADB_ROOT_PASSWORD',
    },
    healthCheck: {
      test: ['CMD', 'healthcheck.sh', '--connect', '--innodb_initialized'],
      interval: '10s',
      timeout: '5s',
      retries: 5,
    },
  },
]
