from setuptools import setup

setup(name='dablchess-bot',
      version='1.0',
      description='DABL Chess Operator',
      author='Digital Asset',
      license='Apache2',
      install_requires=['dazl'],
      packages=['bot'],
      include_package_data=True)
