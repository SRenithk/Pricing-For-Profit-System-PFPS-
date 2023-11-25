mkdir $(Build.ArtifactStagingDirectory)\\dist
xcopy "dist\\rate-card" $(Build.ArtifactStagingDirectory)\\dist /E/H/C
