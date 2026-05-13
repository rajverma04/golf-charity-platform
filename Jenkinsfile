pipeline {
    agent any

    environment {
        // Replace credentials ID with the ID configured in your Jenkins instance
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKERHUB_USERNAME = 'rajverma4'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install System Runtimes & Dependencies') {
            steps {
                echo 'Setting up project environments...'
                dir('backend') {
                    sh 'npm install'
                }
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Lint & Static Analysis') {
            steps {
                echo 'Auditing codebase quality...'
                dir('frontend') {
                    sh 'npm run lint'
                }
            }
        }

        stage('Build Client Artifacts') {
            steps {
                echo 'Compiling Production Frontend (Vite)...'
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Build Container Images') {
            steps {
                echo 'Generating Docker Containers...'
                sh "docker build -t ${DOCKERHUB_USERNAME}/charity-backend:latest ./backend"
                sh "docker build -t ${DOCKERHUB_USERNAME}/charity-frontend:latest ./frontend"
            }
        }

        stage('Deliver to Registry') {
            steps {
                echo 'Pushing artifacts to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CREDENTIALS_ID, usernameVariable: 'D_USER', passwordVariable: 'D_PASS')]) {
                    sh 'echo $D_PASS | docker login -u $D_USER --password-stdin'
                    sh "docker push ${DOCKERHUB_USERNAME}/charity-backend:latest"
                    sh "docker push ${DOCKERHUB_USERNAME}/charity-frontend:latest"
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! Platform artifacts generated and pushed.'
        }
        failure {
            echo 'Pipeline execution encountered an error. Review console output for failure reasons.'
        }
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
}
