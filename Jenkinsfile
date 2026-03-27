pipeline {
    agent any
	stages {
	    stage('Build') {
            steps {
                nodejs(nodeJSInstallationName: 'node24') {
                    sh 'corepack enable'
					sh 'yarn install'
					sh 'xvfb-run --auto-servernum yarn test'
                }
            }
        }
        stage('Sonar') {
            environment {
                scannerHome = tool 'SonarQube Scanner default'
            }
            steps {
                withSonarQubeEnv('SonarQube Community') {
                    sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=leosac_card-printing-worker_c67bb037-6e0b-4e77-87d2-650ff82f32f1"
                }
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate(abortPipeline: true)
                }
            }
            when {
                anyOf {
                    branch 'main'
                    buildingTag()
                    changeRequest()
                }
            }
        }
    }
}