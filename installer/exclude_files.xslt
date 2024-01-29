<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
  xmlns:wix="http://schemas.microsoft.com/wix/2006/wi" 
  xmlns="http://schemas.microsoft.com/wix/2006/wi" version="1.0" exclude-result-prefixes="xsl wix">

  <xsl:output method="xml" indent="yes" omit-xml-declaration="yes" />

  <xsl:strip-space elements="*" />

  <!-- find .gitignore file -->
  <xsl:key name="gitignore" match="wix:Component[ parent::wix:DirectoryRef[@Id = 'INSTALLDIR'] and contains(wix:File/@Source, '.gitignore') ]" use="@Id" />
  
  <!-- find .dockerignore file -->
  <xsl:key name="dockerignore" match="wix:Component[ parent::wix:DirectoryRef[@Id = 'INSTALLDIR'] and contains(wix:File/@Source, '.dockerignore') ]" use="@Id" />
  
  <!-- find Dockerfile file -->
  <xsl:key name="dockerfile" match="wix:Component[ parent::wix:DirectoryRef[@Id = 'INSTALLDIR'] and contains(wix:File/@Source, 'Dockerfile') ]" use="@Id" />

  <!-- find README.md file -->
  <xsl:key name="readme" match="wix:Component[ parent::wix:DirectoryRef[@Id = 'INSTALLDIR'] and contains(wix:File/@Source, 'README.md') ]" use="@Id" />

  <!-- find .git directory -->
  <xsl:key name="gitDir" match="wix:Directory[@Name = '.git']" use="@Id" />
  <xsl:key name="gitRef" match="wix:Component[ancestor::wix:Directory[@Name = '.git']]" use="@Id" />

  <!-- find installer directory -->
  <xsl:key name="installerDir" match="wix:Directory[@Name = 'installer']" use="@Id" />
  <xsl:key name="installerRef" match="wix:Component[ancestor::wix:Directory[@Name = 'installer']]" use="@Id" />
  
    <!-- find repository directory -->
  <xsl:key name="repositoryDir" match="wix:Directory[@Name = 'repository']" use="@Id" />
  <xsl:key name="repositoryRef" match="wix:Component[ancestor::wix:Directory[@Name = 'repository']]" use="@Id" />

  <!-- By default, copy all elements and nodes into the output... -->
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()" />
    </xsl:copy>
  </xsl:template>

  <!-- ...but if the element has a matching key then don't render anything (i.e. removing it from the output) -->
  <xsl:template match="*[ self::wix:Component or self::wix:ComponentRef ][ key( 'gitignore', @Id ) ]" />
  
  <xsl:template match="*[ self::wix:Component or self::wix:ComponentRef ][ key( 'dockerignore', @Id ) ]" />
  
  <xsl:template match="*[ self::wix:Component or self::wix:ComponentRef ][ key( 'dockerfile', @Id ) ]" />

  <xsl:template match="*[ self::wix:Component or self::wix:ComponentRef ][ key( 'readme', @Id ) ]" />

  <xsl:template match="*[ self::wix:Directory ][ key( 'gitDir', @Id ) ]" />
  <xsl:template match="wix:ComponentRef[key('gitRef', @Id)]" />
  
  <xsl:template match="*[ self::wix:Directory ][ key( 'installerDir', @Id ) ]" />
  <xsl:template match="wix:ComponentRef[key('installerRef', @Id)]" />
  
  <xsl:template match="*[ self::wix:Directory ][ key( 'repositoryDir', @Id ) ]" />
  <xsl:template match="wix:ComponentRef[key('repositoryRef', @Id)]" />

</xsl:stylesheet>